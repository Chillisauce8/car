import { defineNuxtConfig } from 'nuxt/config';
import environment from './environment';


function prepareNitroRouteRules(): Record<string, any> {
  const proxyConfig = Object.entries(environment?.devProxy ?? {})
    .reduce((config, [suffix, target]) => {
      const wildcardUrl = '**'
      if (!suffix?.endsWith(wildcardUrl)) {
        suffix = suffix.endsWith('/') ? suffix + wildcardUrl : suffix + '/' + wildcardUrl;
      }

      config[suffix] = {proxy: target + suffix};

      return config;
    }, {});

  return {
    ...(proxyConfig ?? {}),
    ...(environment?.routeRules ?? {}),
  };
}


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
      '@nuxt/ui-pro',
  ],
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'nuxt-delay-hydration',],
  ssr: environment.ssr ?? true,
  // css: [
  //   "@/assets/css/global.scss"
  // ],
  app: {
  // Added below for page transitions   
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'en-gb',
      },
      link: [
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
// j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
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
      ],
    },
  },
  build: {
    // transpile: ['@vuepic/vue-datepicker'],
    analyze: true,
    // optimization: {
    //   runtimeChunk: 'single',
    // },
  },
  vite: {
    css: {
      preprocessorOptions: {
        // scss: {
        //   additionalData: '@use "@/assets/css/vars.scss" as *;',
        // },
      },
    },
    esbuild: environment.leaveDebuggers ? undefined : {
      drop: ['debugger'],
    },
    optimizeDeps: {
      exclude: ['fsevents'],
    },
    build: {
      rollupOptions: {
        output: {

        }
      }
    },
  },
  delayHydration: {
    // enables nuxt-delay-hydration in dev mode for testing
    // NOTE: you should disable this once you've finished testing, it will break HMR
    // debug: process.env.NODE_ENV === 'development',
    mode: 'mount',
    replayClick: true
  },
  plugins: [
    // {src: '~/plugins/clear-path-from-app-payload.ts', mode: 'server'},
  ],
  components: [
    {
      path: '~/components', // will get any components nested in let's say /components/test too
      pathPrefix: false,
    },
  ],
  nitro: {
    routeRules: prepareNitroRouteRules(),
    preset: 'node-server'
  },
  hooks: {
    // 'pages:extend': pages => pagesExtend(pages),
  },
  experimental: {
    componentIslands: true
  },
  // router: {
  //   prefetchLinks: false
  // },
})
