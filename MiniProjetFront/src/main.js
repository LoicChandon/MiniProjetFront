import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


//vuetify shenanigans
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1565C0',
          secondary: '#42A5F5',
          accent: '#00897B',
          error: '#E53935',
          warning: '#FB8C00',
          success: '#43A047',
        },
      },
    },
  },
})

createApp(App).use(vuetify).mount('#app')
