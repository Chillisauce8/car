// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path';
import environment from './environment';
import { useTheme } from './composables/useTheme';
import commonjs from 'vite-plugin-commonjs';

const { DefaultTheme } = useTheme();

export default defineNuxtConfig({
    //  extends: [process.env.NUXT_UI_PRO_PATH || '@nuxt/ui-pro'],
    modules: ['@nuxt/fonts', '@pinia/nuxt', '@vueuse/nuxt', 'nuxt-delay-hydration', '@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@nuxt/image', '@vueuse/motion/nuxt', '@sidebase/nuxt-auth'],

    auth: {
        baseURL: process.env.NUXT_PUBLIC_AUTH_ORIGIN || 'http://localhost:3000',
        globalMiddleware: true,
        provider: {
            type: 'authjs'
        },
        pages: {
            signIn: '/auth/login',
            register: '/auth/register'
        }
    },

    primevue: {
        autoImport: true,
        options: {
            theme: {
                preset: DefaultTheme,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        },
        components: {
            include: '*'  // This will include all PrimeVue components
        },
        directives: {
            include: ['Tooltip', 'ripple']
        }
    },

    devtools: {
        enabled: false
    },

    ssr: environment.ssr ?? true,

    css: [
        resolve(__dirname, './assets/css/global.scss'),
        resolve(__dirname, './assets/styles.scss'),
        resolve(__dirname, './assets/tailwind.css'),
        'primeicons/primeicons.css',
        '@uppy/core/dist/style.css',
        '@uppy/dashboard/dist/style.css',
        '@uppy/drag-drop/dist/style.css',
        '@uppy/progress-bar/dist/style.css'
    ],

    image: {
        cloudinary: {
            baseURL: 'https://media.chillisauce.com/image/upload/'
        }
    },

    app: {
        // Added below for page transitions
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            htmlAttrs: {
                lang: 'en-gb'
            },
            link: [
                // {
                //   rel: 'stylesheet',
                //   href: '/layout/styles/theme/theme-light/cyan/theme.css',
                //   id: 'theme-link'
                // },
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
                // {
                //   rel: 'preconnect',
                //   href: 'https://www.googletagmanager.com',
                // },
                // {
                //   rel: 'preconnect',
                //   href: 'https://www.google-analytics.com',
                // },
                // {
                //   rel: 'preconnect',
                //   href: 'https://dev.visualwebsiteoptimizer.com',
                // },
            ],
            meta: [
                // {'http-equiv': 'facebook-domain-verification', content: 'l2qnfoxdzmqifs6ogg9s22feps3qda'},
                // {'http-equiv': 'Accept-CH', content: 'sec-ch-dpr'}
            ],
            script: [
                //         {
                //           children: `
                // window.dataLayer = window.dataLayer || [];
                // let originalLocation = document.location.protocol + '//' +
                //   document.location.hostname +
                //   document.location.pathname +
                //   document.location.search;
                // window.dataLayer.push({originalLocation: originalLocation});
                //           `,
                //         },
                //         {
                //           children: `
                // (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                // new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                // j=d.createElement(s),dl=l!='dataLayer'?'&l='+l;'';j.async=true;j.src=
                // 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                // })(window,document,'script','dataLayer','GTM-TN9S8S6');
                //           `,
                //         },
                //         {
                //           type: 'text/javascript',
                //           id: 'vwoCode',
                //           children: `
                //           window._vwo_code || (function() {
                // var account_id=823561,
                // version=2.0,
                // settings_tolerance=2000,
                // hide_element='body',
                // hide_element_style = 'opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important',
                // /* DO NOT EDIT BELOW THIS LINE */
                // f=false,w=window,d=document,v=d.querySelector('#vwoCode'),cK='_vwo_'+account_id+'_settings',cc={};try{var c=JSON.parse(localStorage.getItem('_vwo_'+account_id+'_config'));cc=c&&typeof c==='object'?c:{}}catch(e){}var stT=cc.stT==='session'?w.sessionStorage:w.localStorage;code={use_existing_jquery:function(){return typeof use_existing_jquery!=='undefined'?use_existing_jquery:undefined},library_tolerance:function(){return typeof library_tolerance!=='undefined'?library_tolerance:undefined},settings_tolerance:function(){return cc.sT||settings_tolerance},hide_element_style:function(){return'{'+(cc.hES||hide_element_style)+'}'},hide_element:function(){return typeof cc.hE==='string'?cc.hE:hide_element},getVersion:function(){return version},finish:function(){if(!f){f=true;var e=d.getElementById('_vis_opt_path_hides');if(e)e.parentNode.removeChild(e)}},finished:function(){return f},load:function(e){var t=this.getSettings(),n=d.createElement('script'),i=this;if(t){n.textContent=t;d.getElementsByTagName('head')[0].appendChild(n);if(!w.VWO||VWO.caE){stT.removeItem(cK);i.load(e)}}else{n.fetchPriority='high';n.src=e;n.type='text/javascript';n.onerror=function(){_vwo_code.finish()};d.getElementsByTagName('head')[0].appendChild(n)}},getSettings:function(){try{var e=stT.getItem(cK);if(!e){return}e=JSON.parse(e);if(Date.now()>e.e){stT.removeItem(cK);return}return e.s}catch(e){return}},init:function(){if(d.URL.indexOf('__vwo_disable__')>-1)return;var e=this.settings_tolerance();w._vwo_settings_timer=setTimeout(function(){_vwo_code.finish();stT.removeItem(cK)},e);var t=d.currentScript,n=d.createElement('style'),i=this.hide_element(),r=t&&!t.async&&i?i+this.hide_element_style():'',c=d.getElementsByTagName('head')[0];n.setAttribute('id','_vis_opt_path_hides');v&&n.setAttribute('nonce',v.nonce);n.setAttribute('type','text/css');if(n.styleSheet)n.styleSheet.cssText=r;else n.appendChild(d.createTextNode(r));c.appendChild(n);this.load('https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(d.URL)+'&vn='+version)}};w._vwo_code=code;code.init();})();
                //           `,
                //         },
            ]
        }
    },

    build: {
        // transpile: ['@vuepic/vue-datepicker'],

        analyze: true
        // optimization: {
        //   runtimeChunk: 'single',
        // },
    },

    alias: {
        '@': resolve(__dirname, './'),
        '~': resolve(__dirname, './'),
        quill: process.dev ? 'quill/dist/quill.js' : 'quill'
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "sass:math";
                        @use "${resolve(__dirname, './assets/css/vars')}" as *;
                        @use "${resolve(__dirname, './assets/css/_mixins')}" as *;
                    `
                }
            }
        },
        plugins: [
            {
                name: 'custom-blocks',
                transform(code, id) {
                    if (!/vue&type=custom-docs/.test(id)) return;
                    return `export default ${JSON.stringify(code)}`;
                }
            },
            commonjs({
                filter(id) {
                    if (id.includes('node_modules/')) {
                        return true;
                    }
                },
                advanced: {
                    importRules: (id: string) => 'namedFirst'
                }
            })
        ],
        optimizeDeps: {
            exclude: ['fsevents'],
            include: ['quill', 'lodash'],
            noDiscovery: true
        },
        build: {
            sourcemap: false,
            rollupOptions: {
                output: {}
            }
        }
    },

    delayHydration: {
        // enables nuxt-delay-hydration in dev mode for testing
        // NOTE: you should disable this once you've finished testing, it will break HMR
        // debug: process.env.NODE_ENV === 'development',
        mode: 'mount',
        replayClick: true
    },

    plugins: [
        { src: resolve(__dirname, './plugins/app.js') },
        { src: resolve(__dirname, './plugins/default-http-interceptors.ts') },
        { src: resolve(__dirname, './plugins/js-extend.ts') }
    ],

    components: {
        dirs: [
            {
                path: '~/components',
                pathPrefix: false
            },
            {
                path: '~/layouts',
                pathPrefix: false
            }
        ]
    },

    pages: true,

    hooks: {
        'pages:extend': (pages: any[]) => {
            pages.push({
                name: 'Edit Test Form',
                path: '/new/test-form/:id',
                file: resolve(__dirname, './pages/new/test-form.vue')
            });
            pages.push({
                name: 'Market List',
                path: '/market',
                file: resolve(__dirname, './pages/market/list.vue')
            });
            pages.push({
                name: 'Market',
                path: '/market/:slug+',
                file: resolve(__dirname, './pages/market/slug.vue')
            });

            pages.push({
                name: 'index',
                path: '/',
                file: resolve(__dirname, './pages/index.vue')
            });
            pages.push({
                name: 'message',
                path: '/new/message',
                file: resolve(__dirname, './pages/new/Message.vue'),
                children: [
                    {
                        path: '',
                        name: 'message-index', // Add name to remove warning
                        redirect: '/new/message/inbox'
                    },
                    {
                        path: 'compose',
                        name: 'message-compose',
                        props: { mode: 'new' }
                    },
                    {
                        path: 'detail/:id',
                        name: 'message-detail',
                        props: true
                    },
                    {
                        path: 'starred',
                        name: 'message-starred',
                        props: true
                    },
                    {
                        path: 'spam',
                        name: 'message-spam',
                        props: true
                    },
                    {
                        path: 'important',
                        name: 'message-important',
                        props: true
                    },
                    {
                        path: 'sent',
                        name: 'message-sent',
                        props: true
                    },
                    {
                        path: 'archived',
                        name: 'message-archived',
                        props: true
                    },
                    {
                        path: 'trash',
                        name: 'message-trash',
                        props: true
                    }
                ]
            });
            pages.push({
                name: 'message',
                path: '/new/message',
                file: resolve(__dirname, './pages/new/Message.vue'),
                children: [
                    {
                        path: '',
                        name: 'message-index',
                        redirect: '/new/message/inbox'
                    },
                    {
                        path: 'inbox',
                        name: 'message-inbox',
                        file: resolve(__dirname, './pages/new/message/[folder].vue')
                    },
                    {
                        path: 'compose',
                        name: 'message-compose',
                        props: { mode: 'new' }
                    },
                    {
                        path: 'thread/:id',
                        name: 'message-thread',
                        props: true
                    },
                    {
                        path: ':folder',
                        name: 'message-folder',
                        file: resolve(__dirname, './pages/new/message/[folder].vue'),
                        props: true
                    }
                ]
            });
        }
    },

    /*
    hooks: {
        'pages:extend': (pages: any[]) => {
            pages.push({
                name: 'e-commerce',
                path: '/',
                file: '@/pages/dashboards/index.vue',
                meta: {
                    breadcrumb: ['E-Commerce Dashboard']
                }
            });
            pages.push({
                name: 'banking',
                path: '/dashboard-banking',
                file: '@/pages/dashboards/Banking.vue',
                meta: {
                    breadcrumb: ['Banking Dashboard']
                }
            });
            pages.push({
                name: 'apps-calendar',
                path: '/apps/calendar/',
                file: '@/pages/apps/Calendar.vue'
            });
            pages.push({
                name: 'chat',
                path: '/apps/chat/',
                file: '@/pages/apps/chat/Index.vue'
            });
            pages.push({
                name: 'mail',
                path: '/apps/mail/',
                file: '@/pages/apps/mail/MessageList.vue',
                children: [
                    {
                        path: '/apps/mail/inbox',
                        name: 'mail-inbox',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    },
                    {
                        path: '/apps/mail/compose',
                        name: 'mail-compose',
                        file: '@/pages/apps/mail/MessageNew.vue'
                    },
                    {
                        path: '/apps/mail/detail/:id',
                        name: 'mail-detail',
                        file: '@/pages/apps/mail/MessageDetail.vue'
                    },
                    {
                        path: '/apps/mail/starred',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    },
                    {
                        path: '/apps/mail/spam',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    },
                    {
                        path: '/apps/mail/important',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    },
                    {
                        path: '/apps/mail/sent',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    },
                    {
                        path: '/apps/mail/archived',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    },
                    {
                        path: '/apps/mail/trash',
                        file: '@/pages/apps/mail/MessageTypes.vue'
                    }
                ]
            });
            pages.push({
                name: 'market-test',
                path: '/apps/market-test',
                file: '@/pages/apps/market-test/List.vue'
            });
            pages.push({
                name: 'tasklist',
                path: '/apps/tasklist',
                file: '@/pages/apps/tasklist/Index.vue'
            });
            pages.push({
                name: 'Task List Test',
                path: '/apps/tasklisttest',
                file: '@/pages/apps/tasklist/IndexTest.vue'
            });
            pages.push({
                path: '/blocks',
                name: 'blocks',
                meta: {
                    breadcrumb: ['Prime Blocks', 'Free Blocks']
                },
                file: '@/pages/utilities/Blocks.vue'
            });
            pages.push({
                name: 'landing',
                path: '/landing',
                file: '@/pages/pages/Landing.vue'
            });
            pages.push({
                name: 'error',
                path: '/auth/error',
                file: '@/pages/pages/auth/Error.vue'
            });
            pages.push({
                name: 'forgotpassword',
                path: '/auth/forgotpassword',
                file: '@/pages/pages/auth/ForgotPassword.vue'
            });
            pages.push({
                name: 'lockscreen',
                path: '/auth/lockscreen',
                file: '@/pages/pages/auth/LockScreen.vue'
            });
            pages.push({
                name: 'login',
                path: '/auth/login',
                file: '@/pages/pages/auth/Login.vue'
            });
            pages.push({
                name: 'newpassword',
                path: '/auth/newpassword',
                file: '@/pages/pages/auth/NewPassword.vue'
            });
            pages.push({
                name: 'register',
                path: '/auth/register',
                file: '@/pages/pages/auth/Register.vue'
            });
            pages.push({
                name: 'verification',
                path: '/auth/verification',
                file: '@/pages/pages/auth/Verification.vue'
            });
            pages.push({
                name: 'accessDenied',
                path: '/auth/access',
                file: '@/pages/pages/auth/Access.vue'
            });
            pages.push({
                name: 'productoverview',
                path: '/ecommerce/product-overview',
                file: '@/pages/e-commerce/ProductOverview.vue'
            });
            pages.push({
                name: 'checkoutform',
                path: '/ecommerce/checkout-form',
                file: '@/pages/e-commerce/CheckoutForm.vue'
            });
            pages.push({
                name: 'newproduct',
                path: '/ecommerce/new-product',
                file: '@/pages/e-commerce/NewProduct.vue'
            });
            pages.push({
                name: 'orderhistory',
                path: '/ecommerce/order-history',
                file: '@/pages/e-commerce/OrderHistory.vue'
            });
            pages.push({
                name: 'ordersummary',
                path: '/ecommerce/order-summary',
                file: '@/pages/e-commerce/OrderSummary.vue'
            });
            pages.push({
                name: 'productlist',
                path: '/ecommerce/product-list',
                file: '@/pages/e-commerce/ProductList.vue'
            });
            pages.push({
                name: 'shoppingcart',
                path: '/ecommerce/shopping-cart',
                file: '@/pages/e-commerce/ShoppingCart.vue'
            });
            pages.push({
                name: 'userlist',
                path: '/profile/list',
                file: '@/pages/user-management/UserList.vue',
                meta: {
                    breadcrumb: ['User Management', 'List']
                }
            });
            pages.push({
                name: 'user-create',
                path: '/profile/create',
                file: '@/pages/user-management/UserCreate.vue',
                meta: {
                    breadcrumb: ['User Management', 'Create']
                }
            });
            pages.push({
                name: 'documentation',
                path: '/documentation',
                file: '@/pages/utilities/Documentation.vue'
            });
            pages.push({
                name: 'formlayout',
                path: '/uikit/formlayout/',
                file: '@/pages/uikit/FormLayoutDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Form Layout']
                }
            });
            pages.push({
                name: 'Button',
                path: '/uikit/button/',
                file: '@/pages/uikit/ButtonDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Button']
                }
            });
            pages.push({
                name: 'table',
                path: '/uikit/table/',
                file: '@/pages/uikit/TableDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Table']
                }
            });
            pages.push({
                name: 'list',
                path: '/uikit/list/',
                file: '@/pages/uikit/ListDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'List']
                }
            });
            pages.push({
                name: 'tree',
                path: '/uikit/tree/',
                file: '@/pages/uikit/TreeDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Tree']
                }
            });
            pages.push({
                name: 'panel',
                path: '/uikit/panel/',
                file: '@/pages/uikit/PanelsDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Panel']
                }
            });
            pages.push({
                name: 'overlay',
                path: '/uikit/overlay/',
                file: '@/pages/uikit/OverlayDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Overlay']
                }
            });
            pages.push({
                name: 'media',
                path: '/uikit/media/',
                file: '@/pages/uikit/MediaDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Media']
                }
            });
            pages.push({
                name: 'message',
                path: '/uikit/message/',
                file: '@/pages/uikit/MessagesDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Message']
                }
            });
            pages.push({
                name: 'file',
                path: '/uikit/file/',
                file: '@/pages/uikit/FileDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'File']
                }
            });
            pages.push({
                name: 'misc',
                path: '/uikit/misc/',
                file: '@/pages/uikit/MiscDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Misc']
                }
            });
            pages.push({
                name: 'input',
                path: '/uikit/input/',
                file: '@/pages/uikit/InputDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Input']
                }
            });
            pages.push({
                name: 'charts',
                path: '/uikit/charts/',
                file: '@/pages/uikit/ChartDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Charts']
                }
            });
            pages.push({
                name: 'menu',
                path: '/uikit/menu/',
                file: '@/pages/uikit/MenuDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Menu']
                }
            });
            pages.push({
                name: 'timeline',
                path: '/uikit/timeline/',
                file: '@/pages/uikit/TimelineDoc.vue',
                meta: {
                    breadcrumb: ['UI Kit', 'Timeline']
                }
            });
            pages.push({
                name: 'starred',
                path: '/apps/mail/starred',
                file: '@/pages/apps/mail/MailTypes.vue'
            });
            pages.push({
                name: 'spam',
                path: '/apps/mail/spam',
                file: '@/pages/apps/mail/MailTypes.vue'
            });
            pages.push({
                name: 'important',
                path: '/apps/mail/important',
                file: '@/pages/apps/mail/MailTypes.vue'
            });
            pages.push({
                name: 'sent',
                path: '/apps/mail/sent',
                file: '@/pages/apps/mail/MailTypes.vue'
            });
            pages.push({
                name: 'archived',
                path: '/apps/mail/archived',
                file: '@/pages/apps/mail/MailTypes.vue'
            });
            pages.push({
                name: 'trash',
                path: '/apps/mail/trash',
                file: '@/pages/apps/mail/MailTypes.vue'
            });
            // pages.push({
            //     name: 'Calendar',
            //     path: '/new/calendar',
            //     file: '@/pages/new/Calendar.vue'
            // });
            pages.push({
                name: 'Images Fetching',
                path: '/new/images-fetching',
                file: '@/pages/new/imagesfetching.vue'
            });
            pages.push({
                name: 'Market List',
                path: '/market',
                file: '@/pages/market/list.vue'
            });
            pages.push({
                name: 'Market',
                path: '/market/:slug+',
                file: '@/pages/market/slug.vue'
            });
        }
    },
*/
    alias: {
        quill: process.dev ? 'quill/dist/quill.js' : 'quill'
    },

    nitro: {
        devProxy: environment.devProxy ?? {},
        routeRules: {
            '/api/auth/**': { cors: true, security: { xframe: 'DENY' } },
            ...environment?.routeRules ?? {}
        },
        publicAssets: [
            {
                dir: 'docs/**/*',
                maxAge: 60 * 60 * 24 * 7 // Cache for 1 week
            }
        ]
    },

    compatibilityDate: '2024-10-14',

    imports: {
        autoImport: true,
        dirs: ['composables/**', 'utils/**']
    },

    runtimeConfig: {
        // The runtimeConfig is now empty since we're not using direct MongoDB connection
    }
});
