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
          appendTsSuffixTo: [/\.vue$/],
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
  }
  template: '<button @click="onClick">Click!</button>'
})
export default class MyComponent extends Vue {
  // 初始数据可以直接声明为实例的属性
  message: string = 'Hello!'

  // 组件方法也可以直接声明为实例的方法
  onClick (): void {
    window.alert(this.message)
  }
}
```

