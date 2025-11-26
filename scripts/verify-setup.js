#!/usr/bin/env node

/**
 * Setup Verification Script
 *
 * Verifies that the Case Studies CMS is properly configured
 * Run with: node scripts/verify-setup.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🔍 ${msg}${colors.reset}\n`)
};

class SetupVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.supabase = null;
  }

  // Load and verify environment variables
  async checkEnvironmentVariables() {
    log.header('Checking Environment Variables');

    // Try to load from .env.local first, then .env
    const envFiles = ['.env.local', '.env'];
    let envLoaded = false;

    for (const envFile of envFiles) {
      const envPath = path.join(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        log.info(`Loaded environment from ${envFile}`);
        envLoaded = true;
        break;
      }
    }

    if (!envLoaded) {
      this.errors.push('No .env.local or .env file found');
      log.error('No environment file found. Please copy .env.example to .env.local');
      return false;
    }

    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const optionalVars = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_URL'
    ];

    let allRequired = true;

    // Check required variables
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        log.success(`${varName} is set`);
      } else {
        this.errors.push(`Missing required environment variable: ${varName}`);
        log.error(`${varName} is not set`);
        allRequired = false;
      }
    }

    // Check optional variables
    for (const varName of optionalVars) {
      if (process.env[varName]) {
        log.success(`${varName} is set`);
      } else {
        this.warnings.push(`Optional environment variable not set: ${varName}`);
        log.warning(`${varName} is not set (optional)`);
      }
    }

    // Validate URL format
    if (process.env.SUPABASE_URL) {
      try {
        new URL(process.env.SUPABASE_URL);
        if (process.env.SUPABASE_URL.includes('supabase.co')) {
          log.success('SUPABASE_URL format is valid');
        } else {
          this.warnings.push('SUPABASE_URL does not appear to be a Supabase URL');
          log.warning('SUPABASE_URL does not look like a Supabase URL');
        }
      } catch (error) {
        this.errors.push('SUPABASE_URL is not a valid URL');
        log.error('SUPABASE_URL is not a valid URL format');
        allRequired = false;
      }
    }

    return allRequired;
  }

  // Test Supabase connection
  async checkSupabaseConnection() {
    log.header('Testing Supabase Connection');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      log.error('Cannot test connection - missing credentials');
      return false;
    }

    try {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      // Test basic connection
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('count', { count: 'exact', head: true });

      if (error) {
        this.errors.push(`Supabase connection failed: ${error.message}`);
        log.error(`Connection failed: ${error.message}`);
        return false;
      }

      log.success('Supabase connection successful');
      return true;
    } catch (error) {
      this.errors.push(`Supabase connection error: ${error.message}`);
      log.error(`Connection error: ${error.message}`);
      return false;
    }
  }

  // Verify database tables exist
  async checkDatabaseTables() {
    log.header('Checking Database Tables');

    if (!this.supabase) {
      log.error('Cannot check tables - no Supabase connection');
      return false;
    }

    const requiredTables = [
      'case_studies',
      'case_study_images',
      'user_profiles'
    ];

    let allTablesExist = true;

    for (const table of requiredTables) {
      try {
        const { error } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          if (error.code === '42P01') {
            this.errors.push(`Table '${table}' does not exist`);
            log.error(`Table '${table}' does not exist`);
            allTablesExist = false;
          } else {
            this.warnings.push(`Could not verify table '${table}': ${error.message}`);
            log.warning(`Could not verify table '${table}': ${error.message}`);
          }
        } else {
          log.success(`Table '${table}' exists`);
        }
      } catch (error) {
        this.errors.push(`Error checking table '${table}': ${error.message}`);
        log.error(`Error checking table '${table}': ${error.message}`);
        allTablesExist = false;
      }
    }

    return allTablesExist;
  }

  // Verify storage bucket exists
  async checkStorageBucket() {
    log.header('Checking Storage Configuration');

    if (!this.supabase) {
      log.error('Cannot check storage - no Supabase connection');
      return false;
    }

    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();

      if (error) {
        this.errors.push(`Storage check failed: ${error.message}`);
        log.error(`Storage check failed: ${error.message}`);
        return false;
      }

      const caseStudiesBucket = buckets?.find(bucket => bucket.name === 'case-studies');

      if (caseStudiesBucket) {
        log.success('case-studies storage bucket exists');

        if (caseStudiesBucket.public) {
          log.success('Storage bucket is public (correct)');
        } else {
          this.warnings.push('Storage bucket is not public - images may not display');
          log.warning('Storage bucket is not public - images may not display');
        }

        return true;
      } else {
        this.errors.push('case-studies storage bucket does not exist');
        log.error('case-studies storage bucket does not exist');
        return false;
      }
    } catch (error) {
      this.errors.push(`Storage verification error: ${error.message}`);
      log.error(`Storage verification error: ${error.message}`);
      return false;
    }
  }

  // Test RLS policies
  async checkRLSPolicies() {
    log.header('Testing Row Level Security Policies');

    if (!this.supabase) {
      log.error('Cannot test RLS - no Supabase connection');
      return false;
    }

    try {
      // Test public read access to published case studies
      const { data: publishedCaseStudies, error: readError } = await this.supabase
        .from('case_studies')
        .select('id, title, status')
        .eq('status', 'published')
        .limit(1);

      if (readError) {
        this.warnings.push(`Could not test read access: ${readError.message}`);
        log.warning(`Could not test read access: ${readError.message}`);
      } else {
        log.success('RLS allows reading published case studies');
      }

      // Test that unauthenticated users cannot write
      const { error: writeError } = await this.supabase
        .from('case_studies')
        .insert({
          title: 'Test Case Study',
          client_name: 'Test Client',
          challenge: 'Test Challenge',
          solution: 'Test Solution',
          results: 'Test Results'
        });

      if (writeError) {
        if (writeError.code === '42501' || writeError.message.includes('policy')) {
          log.success('RLS correctly blocks unauthenticated writes');
        } else {
          this.warnings.push(`Unexpected write error: ${writeError.message}`);
          log.warning(`Unexpected write error: ${writeError.message}`);
        }
      } else {
        this.errors.push('RLS allows unauthenticated writes (security issue!)');
        log.error('RLS allows unauthenticated writes (security issue!)');
        return false;
      }

      return true;
    } catch (error) {
      this.warnings.push(`RLS test error: ${error.message}`);
      log.warning(`RLS test error: ${error.message}`);
      return false;
    }
  }

  // Check for admin functions
  async checkAdminFunctions() {
    log.header('Checking Admin Functions');

    if (!this.supabase) {
      log.error('Cannot check admin functions - no Supabase connection');
      return false;
    }

    try {
      // Try to call the make_user_admin function (it should fail without proper permissions)
      const { error } = await this.supabase.rpc('make_user_admin', {
        user_email: 'test@example.com'
      });

      if (error) {
        if (error.code === '42883') {
          this.warnings.push('make_user_admin function not found - run admin migration');
          log.warning('make_user_admin function not found - admin migration may not be run');
        } else if (error.code === '42501' || error.message.includes('permission')) {
          log.success('make_user_admin function exists (permission denied is expected)');
        } else {
          this.warnings.push(`Unexpected admin function error: ${error.message}`);
          log.warning(`Unexpected admin function error: ${error.message}`);
        }
      } else {
        this.warnings.push('make_user_admin function executed unexpectedly');
        log.warning('make_user_admin function executed unexpectedly');
      }

      return true;
    } catch (error) {
      this.warnings.push(`Admin function test error: ${error.message}`);
      log.warning(`Admin function test error: ${error.message}`);
      return false;
    }
  }

  // Check project structure
  checkProjectStructure() {
    log.header('Checking Project Structure');

    const requiredFiles = [
      'src/api/case-studies.ts',
      'src/api/admin/case-studies.ts',
      'src/services/caseStudyService.ts',
      'src/hooks/useCaseStudies.ts',
      'src/hooks/usePublicCaseStudies.ts',
      'src/pages/Expertise.tsx',
      'src/pages/CaseStudy.tsx',
      'src/components/admin/CaseStudyForm.tsx'
    ];

    const requiredDirs = [
      'src/api',
      'src/services',
      'src/hooks',
      'src/components/admin',
      'supabase/migrations'
    ];

    let allFilesExist = true;

    // Check directories
    for (const dir of requiredDirs) {
      if (fs.existsSync(dir)) {
        log.success(`Directory '${dir}' exists`);
      } else {
        this.errors.push(`Directory '${dir}' does not exist`);
        log.error(`Directory '${dir}' does not exist`);
        allFilesExist = false;
      }
    }

    // Check files
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        log.success(`File '${file}' exists`);
      } else {
        this.errors.push(`File '${file}' does not exist`);
        log.error(`File '${file}' does not exist`);
        allFilesExist = false;
      }
    }

    return allFilesExist;
  }

  // Generate summary report
  generateReport() {
    log.header('Setup Verification Summary');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('🎉 All checks passed! Your Case Studies CMS is ready to use.');
      console.log(`
${colors.green}Next steps:${colors.reset}
1. Start the development server: ${colors.bold}pnpm dev${colors.reset}
2. Create your first admin user at: ${colors.bold}http://localhost:5173/signup${colors.reset}
3. Promote user to admin: Run ${colors.bold}SELECT make_user_admin('your-email@example.com');${colors.reset} in Supabase SQL Editor
4. Visit admin dashboard: ${colors.bold}http://localhost:5173/admin${colors.reset}
      `);
      return 0;
    }

    if (this.errors.length > 0) {
      log.error(`Found ${this.errors.length} error(s):`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      log.warning(`Found ${this.warnings.length} warning(s):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    console.log(`\n${colors.yellow}Please fix the errors above before proceeding.${colors.reset}`);
    console.log(`${colors.blue}See CASE_STUDIES_SETUP.md for troubleshooting help.${colors.reset}`);

    return this.errors.length > 0 ? 1 : 0;
  }

  // Run all verification checks
  async runVerification() {
    console.log(`${colors.bold}${colors.blue}Case Studies CMS Setup Verification${colors.reset}\n`);

    try {
      // Run all checks
      const envCheck = await this.checkEnvironmentVariables();
      const connectionCheck = envCheck ? await this.checkSupabaseConnection() : false;
      const tablesCheck = connectionCheck ? await this.checkDatabaseTables() : false;
      const storageCheck = connectionCheck ? await this.checkStorageBucket() : false;
      const rlsCheck = connectionCheck ? await this.checkRLSPolicies() : false;
      const adminCheck = connectionCheck ? await this.checkAdminFunctions() : false;
      const structureCheck = this.checkProjectStructure();

      return this.generateReport();
    } catch (error) {
      log.error(`Verification failed with error: ${error.message}`);
      return 1;
    }
  }
}

// Main execution
if (require.main === module) {
  const verifier = new SetupVerifier();
  verifier.runVerification()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = SetupVerifier;