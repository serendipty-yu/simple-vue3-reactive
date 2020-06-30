import {hasChanged, hasOwn, isObject} from "../shared/utils";
import {reactive} from "./reactive";
import {track, trigger} from "./effect";
import {TrackOpTypes, TriggerOpType} from "./operation";


const get = createGetter()
const set = createSetter()

function createGetter() {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver)

        //console.log('用户对这个对象取值了',target, key)
        track(target, TrackOpTypes.GET,key) //依赖收集
        if(isObject(res)) {
            return reactive(res)
        }
        return res
    }
}

function createSetter() {
    return function set(target, key, value, receiver) {
        const hadKey = hasOwn(target,key)
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)


        if(!hadKey) {
            trigger(target,TriggerOpType.ADD, key,value, oldValue)
            //console.log('属性的新增操作',target, key)
        } else if(hasChanged(value, oldValue)) {
            trigger(target,TriggerOpType.SET, key,value,oldValue)

            //console.log('修改操作',target,key)
        }
        return result
    }
}

export const mutableHandler = {
    get,
    set
}
