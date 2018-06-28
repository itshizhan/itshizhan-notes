# vue集成typescript功能

## 环境搭建

因为vue-cli 3.x 已经继承了typescript了，具体可以参考官方文档。

:::  tip

如果自己搭建vue+typescript+webpack开发环境，主要注意点有：

:::

#### 1. 安装ts-loader

```javascript
npm i ts-loader -D
```

#### 2.配置webpack，非关键部分省略 

```javascript
const baseConfig = {
  entry: {
    bundle: './src/index.ts'  // 入口改为ts
  },
  resolve: {
    extensions: [".js", ".ts",'.tsx','.vue', ".json"],  // 添加ts扩展名
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(tsx|ts)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],   // 为所有.vue 添加ts后缀
        }
      }
    ]
  }
}
```

#### 3.配置tsconfig.json， tsc --init 可以自动生成

```javascript
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,   // 可以对 `this` 上的数据属性进行更严格的推断
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,  // 开启装饰器支持
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "lib": [
      "es2015",   // 支持es6 的语法
      "dom",      // 支持console.log, window,document 等
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

#### 4. 相关js文件修改为ts文件

同时引入.vue 文件时，添加 .vue 后缀以交给ts-loader处理， 因为ts-loader只识别.ts 后缀

#### 5. 引入相关类型定义文件

::: warning

TypeScript并不支持Vue文件，所以需要告诉TypeScript`*.vue`文件交给vue编辑器来处理。可以创建一个vue-shims.d.ts文件 。对于第三方的库，如果自己写类型文件（.d.ts 结尾），可以创建一个`typings`文件夹，放置所有类型定义文件

:::

```javascript

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
```



##  Vue-Class-Component 配置

要让 TypeScript 正确推断 Vue 组件选项中的类型，需要使用 `Vue.component` 或 `Vue.extend` 定义组件：

```javascript
import Vue from 'vue'
const Component = Vue.extend({
  // 类型推断已启用
})

const Component = {
  // 这里不会有类型推断，
  // 因为TypeScript不能确认这是Vue组件的选项
}
```

但是更推荐，官方维护的的 [vue-class-component](https://github.com/vuejs/vue-class-component) 装饰器：

```javascript
import Vue from 'vue'
import Component from 'vue-class-component'
import Header from '@/components/Header.vue' 
import shoplist from from '@/components/Shoplist.vue' 

// @Component 修饰符注明了此类为一个 Vue 组件
@Component({
  //所有的组件选项都可以放在这里
  components:{
    "v-header": Header, // html 标签不能作为vue组件标签名
     shoplist
  },
  props: {
    propMessage: String
  }
  template: '<button @click="onClick">Click!</button>'
})
export default class MyComponent extends Vue {
  data () {
    return {
      // 响应式的
      baz: undefined
    }
  } 
  // 非响应式的
  foo = undefined
  // 响应式的
  bar = null

  //初始数据可以直接声明为实例的属性
  firstName: string = 'hello'
  lastName:string = 'typescript'

  //computed计算属性
   get fullName() {
       return this.firstName + this.lastName;
   }

  // 可以事宜prop值初始化数据
  helloMsg = 'Hello, ' + this.propMessage

  //组件方法也可以直接声明为实例的方法
  onClick (): void {
    window.alert(this.message);
    this.$refs.helloComponent.sayHello()
  }

  bar = () => {
    //修改失败！！！ 此时this 非Vue instance
    this.helloMsg = "modify hello"
  }

   //钩子
   mounted() {
	this.onClick();
   }

  // dynamic component
  $refs!: {
    helloComponent: Hello
  }
}
```



**官方总结如下：**

1. `methods`  方法可以直接声明为类成员方法
2. 初始化数据、计算属性可以直接声明为类的属性
3. data函数，render函数，以及所有的生命周期钩子可以直接声明为类成员方法。
4. 所有选项可以放置在`@Component`装饰器中。
5. 自定义方法如果需要访问`this`，不能使用箭头函数。
6. `undefined`直接初始化的类属性是非相应式的，应该使用`null`，或data中
7. 可以通过 $refs!:{ },定义类型



####   createDecorator 功能函数

vue-class-component 提供了一个工具函数，可以创建自定义的装饰器，例如：

```javascript
// decorators.js
import { createDecorator } from 'vue-class-component'

export const NoCache = createDecorator((options, key) => {
  // component options should be passed to the callback
  // and update for the options object affect the component
  options.computed[key].cache = false
})

// 使用NoCache
import { NoCache } from './decorators'

@Component
class MyComp extends Vue {
  // the computed property will not be cached
  @NoCache
  get random () {
    return Math.random()
  }
}
```



createDecorator 接收一个函数callback作为第一个参数，此函数callback 有三个参数：

- `options`: vue 组件的选项对象
- `key`: 装饰器需要装饰的属性和方法的key
- `parameterIndex`: 如果使用自定义装饰器作为参数时，装饰器参数的索引

**createDecorator源码：**

```typescript
// 接收一个factory 函数，返回一个装饰器VueDecorator
export function createDecorator (factory: (options: ComponentOptions<Vue>, key: string, 	index: number) => void): VueDecorator {
  return (target: Vue | typeof Vue, key?: any, index?: any) => {
    const Ctor = typeof target === 'function'
      ? target as DecoratedClass
      : target.constructor as DecoratedClass
    if (!Ctor.__decorators__) {
      Ctor.__decorators__ = []
    }
    if (typeof index !== 'number') {
      index = undefined
    }
    Ctor.__decorators__.push(options => factory(options, key, index))
  }
}
```



##   vue-property-decorator使用



**vue-property-decorator依赖于vue-class-component, 其源码非常简单，不到200行。**

**当前最新版本提供了8个decorators：**

- `@Emit`
- `@Inject`
- `@Mixins` (the helper function named `mixins` defined at `vue-class-component`)
- `@Model`
- `@Prop`
- `@Provide`
- `@Watch`
- `@Component` (**from** `vue-class-component`)



::: tip 示例解析：

-------

:::

```typescript
import { Vue, Component, 
        Prop,Watch,Model,Emit,Inject,Provide,Mixins } from 'vue-property-decorator'

@Component
export default class YourComponent extends Vue {
  // 定义propA,类型为number，注意使用了！进行类型断言(ts2.7以上要求)
  @Prop(Number) propA!: number 
  
  // 定义属性 propA，类型string，同时指定了默认值
  @Prop({ default: 'default value' }) propB!: string
  
  // 定义属性 propC，类型为 string | boolean
  @Prop([String, Boolean]) propC: string | boolean

  // 自定义组件在使用 v-model 时定制 prop 和 event
  /** 相当于
  props: {
    checked: {
      type: Boolean
    },
    model: {
      prop: 'checked',
      event: 'change'
    }
  }*/
  @Model('change', { type: Boolean }) checked!: boolean
  
  // 相对watch选项，child监听的表达式，onChildChanged为回调函数
  @Watch('child')
  onChildChanged(val: string, oldVal: string) { }

  // 是否深度监听，并立即调用
  @Watch('person', { immediate: true, deep: true })
  onPersonChanged(val: Person, oldVal: Person) { }


  // 注入事件的回调函数，例如 <button @click="addToCount(1)"> 
  @Emit()
  addToCount(n: number) {
    this.count += n
  }

  // 注入事件的回调函数，并在回调执行完后触发reset事件，相对,this.$emit('reset')
  @Emit('reset')
  resetCount() {
    this.count = 0
  }

  // 相应vue的Inject 和Provide选项
  @Inject() foo!: string
  @Provide() foo = 'foo'
  
}

```





## vuex-class使用

依赖

- [Vue](https://github.com/vuejs/vue)
- [Vuex](https://github.com/vuejs/vuex)
- [vue-class-component](https://github.com/vuejs/vue-class-component)

当前提供了5个装饰器：

- `@State`
- `@Getter`
- `@Action`
- `@Mutation`
- `@namespace`



::: tip 示例解析

----

:::

```typescript
// ********** 核心代码 **************

// index.ts
// 导入 actions，getters,mutations 等 
export interface IBookState {
    id:string,// 图书id
    url: string, // 图书url 
    desc: string,// 简介 
    price: number,// 价格
    isDiscount:boolean // 是否打折     
}
interface State {
  books: IBookState[],
}

let state: State = {
  books: [],
}

export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations
})

//getters.ts
export default const getters: GetterTree<any, any> = {
  discountBooks(state:any): IBookState {
    const { books } = state;
    return books.filter(
      (el: IBookState) => !! el.isDiscount
    );
}


// types.ts
export default {
  SET_BOOKS: 'SET_BOOKS'
}

// actions.ts
export default const actions: ActionTree<any, any> = {
  // 获取图书列表
  getBooklist({state,commit}){
    api.getShoplist((shoplist:any)=>{
      // 更新图书列表状态state
      commit(TYPES.SET_BOOKS,shoplist)
    })
  }
}


// mutations.ts
const mutations: MutationTree<any> = {
  [TYPES.SET_BOOKS](state, books): void {
    state.books = books
  }
}
export default mutations


// 组件中使用
export default class BookList extends Vue {
	//初始化状态,图书列表
	@State books!: IBookState[];
	//计算属性，打折的图书列表
	@Getter discountBooks: IBookState[];

	// 注入action
	@Action getBooklist!:()=> void;

	created() {
		//this.$store.dispatch('getBooklist'); // 传统写法
		this.getBooklist();
	}
}
```







## Vue Router使用



```javascript
import Vue, { AsyncComponent } from 'vue'
import Router, { RouteConfig, Route, NavigationGuard } from 'vue-router'

import home: AsyncComponent = (): any => import(/* webpackChunkName: "home" */ '@/pages/home/index.vue')
// ... 其他组件

const routers: RouteConfig[] = [
  {
    path: '/home',
    comment: 'home'
  }
  // ...其他 routers
]
```

如果你想组件内使用 Vue Router 导航钩子，必须注册一次：

```javascript
import Component from 'vue-class-component'

// Register the router hooks with their names
Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // for vue-router 2.2+
])
```







## 常见问题

1. ts 无法识别$ref

   ```javascript
   // 使用类型断言，因为我们可以确定ref 返回的是HTMLDivElement
   this.$refs.inputEl as HTMLDivElement;
   // 或者 自定$refs 的类型
   $refs: {
       inputEl: HTMLDivElement
   }
   
   ```



2.  让 vue 识别全局方法/变量

比如，一些组件的全局方法，`this.$message()` 或 `this.$modal()` 会报错，因为`$message`等属性，并没有在 `vue`实例中声明。可以通过以下方式声明。

```javascript
//https://cn.vuejs.org/v2/guide/typescript.html#%E6%8E%A8%E8%8D%90%E9%85%8D%E7%BD%AE
// 声明全局方法
declare module 'vue/types/vue' {
  interface Vue {
    $Message: any,
    $Modal: any
  }
}
```



