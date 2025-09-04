import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))',
					light: 'hsl(var(--secondary-light))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))',
					light: 'hsl(var(--accent-light))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				heading: ['Inter', 'system-ui', 'sans-serif']
			},
			spacing: {
				'xs': 'var(--space-xs)',
				'sm': 'var(--space-sm)', 
				'md': 'var(--space-md)',
				'lg': 'var(--space-lg)',
				'xl': 'var(--space-xl)',
				'2xl': 'var(--space-2xl)'
			},
			fontSize: {
				'xs': 'var(--text-xs)',
				'sm': 'var(--text-sm)',
				'base': 'var(--text-base)',
				'lg': 'var(--text-lg)',
				'xl': 'var(--text-xl)',
				'2xl': 'var(--text-2xl)',
				'3xl': 'var(--text-3xl)',
				'4xl': 'var(--text-4xl)',
				'5xl': 'var(--text-5xl)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'hover': 'var(--shadow-hover)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'mate-bounce': {
					'0%, 20%, 53%, 80%, 100%': {
						transform: 'translate3d(0,0,0)'
					},
					'40%, 43%': {
						transform: 'translate3d(0, -8px, 0)'
					},
					'70%': {
						transform: 'translate3d(0, -4px, 0)'
					},
					'90%': {
						transform: 'translate3d(0, -2px, 0)'
					}
				},
				'fade-in-up': {
					from: {
						opacity: '0',
						transform: 'translateY(24px)'
					},
					to: {
						opacity: '1', 
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'mate-bounce': 'mate-bounce 1.5s infinite',
				'fade-in-up': 'fade-in-up 0.8s ease-out forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
