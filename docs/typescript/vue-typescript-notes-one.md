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





##   vue-property-decorator使用



## vuex-class使用





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



