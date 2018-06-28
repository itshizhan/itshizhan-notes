module.exports = {
  title: 'It实战笔记',
  description: 'IT实战课堂笔记vuepress版本，包括但不限于node,react,vue,typescript,webpack工具集，前后端等知识',
  dest:'./dist/',
  themeConfig: {
    repo: 'itshizhan/itshizhan-notes',
    sidebar: 'auto',
    nav: [
      { text: 'Node', link: '/node/' },
      { text: 'React', link: '/react/' },
      { text: 'Vue', link: '/vue/' },
      { text: 'Typescript', link: '/typescript/' },
      { text: '工具', link: '/tools/' },
      { text: '常用链接', link: '/lovelinks/' }
    ],
    sidebar: {
      '/node/':[
        '',
        'http'
      ],
      '/typescript/':[
        '',
        'typescript-basic',
        'typescript-advance',
        'vue-typescript-notes-one'
      ]
    }
  }
}