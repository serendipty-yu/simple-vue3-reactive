import {TriggerOpType} from "./operation";

export function effect(fn, options = {}) {
    const effect = createReactiveEffect(fn, options)
    if(!options.lazy) {
        effect()
    }
    return effect
}

let uid = 0
let activeEffect
const effectStack =[]
function createReactiveEffect(fn, options) {
    const effect =  function reactiveEffect() {
        if(!effectStack.includes(effect)) {
            try {
                effectStack.push(effect)
                activeEffect = effect
                return fn()
            } finally {
                effectStack.pop()
                activeEffect = effectStack[effectStack.length - 1]
            }
        }

    }
    effect.options = options
    effect.id = uid++
    effect.deps = []
    // ...

    return effect
}

const targetMap = new WeakMap() //不会导致内存泄漏
export function track(target,type,key) {
    if(activeEffect === undefined) {
        return
    }
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if(!dep) {
        depsMap.set(key, (dep = new Set()))
    }

    if(!dep.has(activeEffect)) {
        dep.add(activeEffect)
        activeEffect.deps.push(dep)
    }
}

export function trigger(target,type,key,value, oldValue) {
    const depsMap = targetMap.get(target)
    if(!depsMap) {
        return
    }
    /*const run = (effects) => {
        if(effects) {
            effects.forEach(effect => effect())
        }
    }*/
    //计算属性的优先级高于effect执行
    const effects = new Set()
    const computedRunners = new Set()

    const add = (effectsToAdd) => {
        if(effectsToAdd) {
            effectsToAdd.forEach(effect => {
                if(effect.options.computed) {
                    computedRunners.add(effect)
                } else {
                    effects.add(effect)
                }
            })
        }
    }

    if(key !== null) {
        add(depsMap.get(key))
    }

    if(type === TriggerOpType.ADD) {
        add(depsMap.get(Array.isArray(target)? 'length': ''))
    }

    const run = (effect) => {
        if(effect.options.scheduler) {
            effect.options.scheduler()
        }else {
            effect()
        }
    }

    effects.forEach(run)
    computedRunners.forEach(run)
}
