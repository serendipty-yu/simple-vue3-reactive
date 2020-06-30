/*import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

createApp(App).mount('#app')*/
import { reactive,effect,computed } from './reactivity'

const state = reactive({name: 'hehe',age:18,arr: [1,2,3]})
let myAge = computed(() => {
    console.log('ok')
    return state.age * 2
})
effect(() => {
    console.log(myAge.value)
})
state.age = 200

