# 1

## 目录说明

src:
|-assets:      资源目录
|-components
|-config
|-entry:       入口js文件，要求目录结构与html文件夹保持一致
|-html:        静态页面模板，使用ejs时会在本地构建时就生成静态模板；要求与entry目录结构保持一致，方便自动查找到入口js文件
|-modules:     公用模块..
|-page:        一些动态页面的逻辑，包括vue文件，js文件等各类文件，直接被entry（入口文件）引用
|-styles:       样式文件，被entry（入口文件）引用，构建后经各种loader后会被抽离独立为一个css文件
|-tpl:         一些全局的模板，例如所有html都依赖的公共header内容
static:        各种外部引入的文件
mock:          环境模拟
test:          单元测试目录，暂时没有配好

## 注意事项

1. fastClick文档在commonjs下使用存在错误， [https://github.com/ftlabs/fastclick/issues/150](https://github.com/ftlabs/fastclick/issues/150)
2. 此处基于Vue框架，所以在page下禁止使用基于ejs的动态模板渲染，请使用vue替代
3. 目前入口文件不支持动态分析，及每次添加entry和html要重启webpack，后续优化看看
4. 本项目使用了style-resources-webpack-plugin将
   * src/styles/mixins/index.less
   * src/styles/variable.less

 注入所有*.vue,*.less文件,在这些文件无需再次@import即可使用mixin和variable

## 环境

测试环境: http://116.62.45.125:22299/
测试环境提交代码时自己提交到 /usr/local/[some name]/\*\_xmall\*/webapps/ROOT 目录下

## 补充规范

1. entry&html 这两个目录结构会直接反应到url上，要求文件名以"-"风格
2. 其他目录约定如下，输出对象的文件名为小驼峰，输出类的文件名为大驼峰，Vue组件等同于类（例外：例如index.vue这种情况，应该将目录名以大驼峰命名）

## todo

1. 单元测试，除非环境差异很大，感觉没有必要分两套环境去测试
2. 动态入口文件分析
