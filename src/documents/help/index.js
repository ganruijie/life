import {HELP_CLASS_ID_LIST} from "./config";

function getDocContent(list, className) {
  const obj = Object.create(null);
  //qaPath 是为了复用文档.html文件而使用的额外属性
  list.forEach(({ title, id, qaPath = "" }) => {
    const [classId, qId] = qaPath.split(".");
    obj[id] = {
      id: qId || id,
      classId: classId || className,
      title,
      content: require(`./${classId || className}/templates/detail-${qId || id}.html`)
    };
  });
  return obj;
}

const configs = { allClasses: {} };
HELP_CLASS_ID_LIST.forEach(className => {
  const config =  configs.allClasses[className] = require(`./${className}/index.js`).default;
  config.questions = getDocContent([...config.list, ...(config.hide || [])], className);
  console.log(require(`./${className}/index.js`));
});
console.log(configs);

export default configs;
