<template>
  <div class="select-dialog">
    <div class="select-result">
      <ul class="result-list">
        <li
          @click="choiceList('first')"
          :class="{
            selectColor: colorSelect === 'first',
            selectBorder: boderSelect === 'first'
          }"
        >
          {{ firstData.text }}
        </li>
        <li
          @click="choiceList('second')"
          :class="{
            selectColor: colorSelect === 'second',
            selectBorder: boderSelect === 'second'
          }"
          v-show="secondData.showSelect"
        >
          {{ secondData.text }}
        </li>
        <li 
          style="float: right;margin-right: 0;width: 30px;height: 25px;"
          @click="closeSelect"
        >
          <div class="close">
            <img
              src="../../assets/recharge/quit@2x.png"
              alt="" >
          </div>
        </li>
      </ul>
    </div>
    <div 
      class="select-item" 
      @touchmove.stop 
      ref="scrollEle">
      <ul 
        class="first-list" 
        v-show="listSelect === 'first'">
        <li
          @click="selectfirst(value, index)"
          :class="{ selected: index === firstData.selectIndex }"
          v-for="(value, index) in firstData.list"
          :key="index"
        >
          <span>{{ value.gameName }}</span>
          <img
            class="select-icon"
            src="../../assets/recharge/right.png"
            alt=""
          >
        </li>
      </ul>
      <ul 
        class="second-list" 
        v-show="listSelect === 'second' && selectType === '2'">
        <li
          @click="selectSecond(value, index)"
          :class="{ selected: index === secondData.selectIndex }"
          v-for="(value, index) in secondData.list"
          :key="index"
        >
          <span>{{ value.gameName }}</span>
          <img
            class="select-icon"
            src="../../assets/recharge/right.png"
            alt=""
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
export default {
  name: "SelectDistrictPopup",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    selectedData: {
      type: Object,
      default() {
        return {};
      },
    },
    itemData: {
      type: Array,
      default() {
        return [];
      },
    },
    selectType: {
      type: String,
      default: "1"
    }
  },
  data() {
    return {
      finallySelect: {},
      //一级相关
      firstData: {
        list: [],
        text: "请选择",
        selectIndex: ""
      },
      //二级相关
      secondData: {
        list: [],
        text: "请选择",
        showSelect: false,
        selectIndex: ""
      },
      //其它
      boderSelect: "first",
      colorSelect: "first",
      listSelect: "first",
    };
  },
  watch: {
    show(to) {
      if (to) {
        this.setFirstList();
        this.showSelectPopup();
        disableBodyScroll(this.$refs.scrollEle);
      } else {
        enableBodyScroll(this.$refs.scrollEle);
      }
    }
  },
  methods: {
    setFirstList() {
      if (this.itemData.length === 0) {
        return;
      }
      //加入一级的数据
      this.firstData.list = [];
      this.itemData.forEach(v => {
        let firstObj = {
          gameId: "",
          gameName: ""
        };
        firstObj.gameId = v.gameId;
        firstObj.gameName = v.gameName;
        this.firstData.list.push(firstObj);
      });
    },
    //点击下面的选项
    selectfirst(value, index) {
      if (this.firstData.selectIndex === index) {
        return;
      }
      //发2种情况，一级目录和二级目录
      if (this.selectType === "1") {
        this.oneSelectFirst(value, index);
      } else {
        this.twoSelectFirst(value, index);
      }
    },
    //一级目录的一级列表选择
    oneSelectFirst(value, index) {
      this.firstData.selectIndex = index;
      this.firstData.text = value.gameName;
      this.finallySelect.firstGameId = value.gameId;
      this.finallySelect.firstGameName = value.gameName;
      this.finallySelect.secondGameId = "";
      this.finallySelect.secondGameName = "";
      this.$emit("update:selectedData", this.finallySelect);
      this.$emit("hidePopup");
    },
    //二级目录的一级列表选择
    twoSelectFirst(value, index) {
      if (this.secondData.showSelect) {
        this.secondData.showSelect = false;
      }
      //边框字体颜色改变
      this.colorSelect = "second";
      this.boderSelect = "second";
      this.listSelect = "second";
      this.finallySelect.firstGameId = value.gameId;
      this.finallySelect.firstGameName = value.gameName;
      //选择一级->一级的改变
      this.firstData.text = value.gameName;
      this.firstData.selectIndex = index;
      //选择一级->二级的改变
      this.secondData.text = "请选择";
      this.secondData.showSelect = true;
      this.secondData.selectIndex = "";
      this.itemData.forEach(v => {
        if (v.gameId === value.gameId) {
          this.secondData.list = v.sonCategories;
        }
      });
    },
    //二级目录的二级列表选择
    selectSecond(value, index) {
      if (this.secondData.selectIndex === index) {
        return;
      }
      //选择二级->二级的改变
      this.secondData.text = value.gameName;
      this.secondData.selectIndex = index;
      this.finallySelect.secondGameId = value.gameId;
      this.finallySelect.secondGameName = value.gameName;
      this.$emit("update:selectedData", this.finallySelect);
      this.$emit("hidePopup");
    },
    //点击上面的选项
    choiceList(value) {
      this.listSelect = value;
      this.boderSelect = value;
    },
    //弹窗弹起时的逻辑
    showSelectPopup() {
      this.finallySelect = { ...this.selectedData };
      if (this.selectType === "1") {
        this.setFirstList();
        this.firstData.text = this.finallySelect.firstGameName;
        this.secondData.showSelect = false;
        this.colorSelect = "first";
        this.boderSelect = "first";
        this.listSelect = "first";
        this.secondData.list = [];
        this.secondData.text = "请选择";
        this.secondData.selectIndex = "";
        //选中的项
        this.firstData.selectIndex = this.firstData.list.findIndex(v => {
          return v.gameId === this.finallySelect.firstGameId;
        });
      } else {
        this.firstData.text = this.finallySelect.firstGameName;
        this.secondData.text = this.finallySelect.secondGameName;
        this.secondData.showSelect = true;
        this.colorSelect = "second";
        this.boderSelect = "second";
        this.listSelect = "second";
        //选中的项
        this.setFirstList();
        this.firstData.selectIndex = this.firstData.list.findIndex(v => {
          return v.gameId === this.finallySelect.firstGameId;
        });
        this.secondData.list = this.itemData.filter(v => {
          return v.gameId === this.firstData.list.filter((v, i) => {
            return i === this.firstData.selectIndex;
          })[0].gameId;
        })[0].sonCategories;
        this.secondData.selectIndex = this.secondData.list.findIndex(v => {
          return v.gameId === this.finallySelect.secondGameId;
        });
      }
    },
    //关闭分区选择
    closeSelect() {
      this.$emit("hidePopup");
    },
  }
};
</script>

<style scoped lang="less">
.select-dialog {
  background-color: #fff;
  height: calc(100vh - 100px);
  box-sizing: border-box;
  padding-top: 18px;
  font-size: .px2rem(14) [];

  .close {
    display: inline-flex;
    float: right;
    height: 13px;
    align-items: center;
    position: relative;
    top: 4px;
    right: 5px;

    img {
      display: block;
      float: right;
      width: 13px;
      height: 13px;
    }
  }

  .select-result {
    position: relative;
    padding: .px2rem(0) [] .px2rem(12) [];
    height: 35px;
    font-size: .px2rem(14) [];
    color: #222222;
    .f-divide-line(@type:border);

    .result-list {
      padding-bottom: 1px;

      li {
        padding-bottom: 12px;
        display: inline-block;
        margin-right: .px2rem(40) [];
      }
      selected
      .selectColor {
        color: #f23030;
      }

      .selectBorder {
        border-bottom: 1.5px solid #f23030;
      }
    }
  }

  .select-item {
    padding: .px2rem(0) [] .px2rem(12) [];
    height: 94%;
    overflow: auto;
    width: 300%;
    &::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      display: none !important;
    }

    .first-list,
    .second-list {
      font-size: .px2rem(14) [];
      color: #222222;
      float: left;
      width: 33.3%;

      li {
        padding-bottom: .px2rem(25) [];
        display: flex;
        justify-items: center;

        .select-icon {
          display: none;
        }
      }

      li:first-child {
        margin-top: .px2rem(20) [];
      }

      li.selected {
        position: relative;
        color: #f23030;

        .select-icon {
          display: inline-block;
          width: .px2rem(20) [];
          height: .px2rem(20) [];
          margin-left: .px2rem(5) [];
        }
      }
    }
  }
}
</style>
