# 正则表达式笔记及常用正则

## 1. Vue如何通过正则校验组件名?

```js
export function validateComponentName (name: string) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'can only contain alphanumeric characters and the hyphen, ' +
      'and must start with a letter.'
    )
  }
}
```
释义：
- a-zA-Z  :匹配所有大小写字母，即vue组件的命名，必须以字母开头。
- \w      :匹配字母、数字、下划线。等价于'[A-Za-z0-9_]'。
- \-      :组件名可以把中划线连字符 `- `.
- \*      :匹配前面的子表达式零次或多次。