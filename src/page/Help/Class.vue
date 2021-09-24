<template>
  <div class="container">
    <ul class="m-questions-wrapper">
      <li 
        class="questions-item" 
        v-for="{ title, id } in questions" 
        :key="id">
        <a
          :href="`${baseUrl}help/detail.html?classId=${configs.id}&qId=${id}`"
          class="link f-active"
        >
          <div class="text-wrapper">
            <span class="title"> {{ title }} </span> <i class="i-arrow right" />
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import helpInfo from "@/documents/help/index";
import * as url from "@/modules/url";
import customerService from "@/plugins/customerService";
import { code, msg } from "@/config/error";
import { SHOW_CONTACT_QA_CLASS_LIST } from "@/config/qaConf";

const classId = url.getParam("classId");

export default {
  name: "HelpClass",
  computed: {
    baseUrl() {
      return process.env.BASE_URL;
    },
    configs() {
      return helpInfo.allClasses[classId];
    },
    questions() {
      return this.configs.list;
    }
  },
  created() {
    document.title = this.configs.title;
    SHOW_CONTACT_QA_CLASS_LIST.includes(classId) && this.getSupport();
  },
  methods: {
    async getSupport() {
      try {
        const link = await customerService.getSupport(
          process.env.VUE_APP_XIANLIAO_ABOUT_API
        );
        link && customerService.show(link);
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
.container {
  font-size: 15px;
}
.m-questions-wrapper {
  .questions-item {
    position: relative;
    overflow: hidden;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    line-height: 21px;

    .link {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding-left: 16/37.5rem;
      padding-top: 19/37.5rem;
      padding-bottom: 10/37.5rem;
      .f-divide-line(@color: #dfdfdf);

      .text-wrapper {
        display: flex;
        align-items: center;
        position: relative;

        .title {
          max-width: .px2rem(268) [];
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .i-arrow.right {
          margin-left: auto;
          margin-right: 0.6rem;
        }
      }
    }
  }
}
</style>
