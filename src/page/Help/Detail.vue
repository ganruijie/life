<template>
  <main class="m-answer-detail">
    <article class="article">
      <h1 class="title">{{ title }}</h1>
      <div 
        class="content" 
        v-html="content" />
    </article>
    <footer
      v-if="supportLink || reportHtmlLink"
      class="footer">
      <a :href="supportLink || reportHtmlLink">{{
        supportLink ? "联系客服" : "意见反馈"
      }}</a>
    </footer>
  </main>
</template>

<script>
import * as url from "@/modules/url";
import * as cookie from "@/modules/cookie";
import helpInfo from "@/documents/help/index";
import customerService from "@/plugins/customerService";
import {code, msg} from "@/config/error";

export default {
  name: "Detail",
  data() {
    return {
      supportLink: ""
    };
  },
  computed: {
    reportHtmlLink() {
      const [token, openId] = [cookie.get("token"), cookie.get("openId")];
      return token && openId
        ? `${process.env.VUE_APP_XIANLIAO_REPORT_URL}?${url.genSearchStr({token, openId})}`
        : "";
    }
  },
  created() {
    this.getSupport();
    const [classId, qId] = [url.getParam("classId"), url.getParam("qId")];
    const { title, content } = helpInfo.allClasses[classId].questions[qId];
    [document.title] = [this.title, this.content] = [title, content];
  },
  methods: {
    async getSupport() {
      try {
        const link = await  customerService.getSupport(process.env.VUE_APP_XIANLIAO_ABOUT_API);
        link && (this.supportLink = link);
      } catch (e) {
        this.$tips.showAlert({
          text: e.msg || msg[e.errorCode] || msg[code.NET_ERR]
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.m-answer-detail {
  display: flex;
  flex-direction: column;
  min-height: stretch;
  font-size: 15px;
  background: #fff;

  .article {
    flex: 1;
    padding-left: 0.4rem;
    line-height: 25px;
  }

  .footer {
    flex-shrink: 0;
    text-align: center;
    background: white;
    color: #00b0e4;
    font-size: 14px;
    border-top: 1px solid #e6e6e6;
    a{
      display: block;
      padding: 12px 0;
    }
  }

  h1.title {
    font-size: 16px;
    line-height: 24px;
    padding: .px2rem(20) [] 0.2666rem .px2rem(20) [] 0;
    font-weight: bold;
    //noinspection CssInvalidPropertyValue
    width: stretch;
    .f-divide-line(@color: #e6e6e6, @type: border, @direction: bottom);
  }

  /deep/.content {
    padding-top: .px2rem(10) [];
    padding-right: .px2rem(10) [];

    .f-text-indent {
      text-indent: 2em;
    }
    
    h2 {
      font-size: 15px;
    }

    b {
      font-weight: bold;
    }

    a {
      color: @color-blue;
    }

    section {
      margin-bottom: .px2rem(26) [];
    }

    .tips {
      margin-top: 1em;
      font-size: 12px;
      line-height: 20px;
      color: #626262;
    }

    .desc-pic {
      display: block;
      margin: .px2rem(16) [] auto 0 auto;
      width: .px2rem(255) [];
      text-align: center;
    }

    .img-list {
      margin-top: .px2rem(25) [];

      .img-item {
        display: block;
        width: .px2rem(255) [];
        margin: .px2rem(20) [] auto;

        img {
          width: 100%;
        }
      }
    }

    .m-table {
      margin: .px2rem(10) [] 0;
      font-size: 12px;
      border-collapse: collapse;
      line-height: 14.4px;

      th {
        padding: .px2rem(6) [];
      }

      td {
        padding: .px2rem(6) [];
      }
    }
  }
}
</style>
