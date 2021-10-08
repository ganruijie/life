<template>
  <form
    class="game-charge-section"
    @submit.prevent="() => false"
  >
    <!-- 阻止表单提交，避免在输入框里回车时触发提交方法 -->
    <div class="page-content">
      <div 
        v-if="!itemId"
        class="game-type">
        <div 
          v-if="chargeList && chargeList.length"
          class="game-type-nav f-clearfix">
          <div
            v-for="item in chargeList"
            :key="item.id"
            class="nav-item-box">
            <div
              class="nav-item"
              @click="selectItem(item.id)"
              :class="{ selected: gameType === item.id }">
              <div class="icon">
                <img
                  class="icon-img"
                  :src="item.imgUrl">
              </div>
              <div class="nav-item-content">
                <p class="text">
                  {{ item.title }}
                </p>
                <p 
                  v-if="item.subtitle"
                  class="charge-item-subtitle"
                >
                  {{ item.subtitle }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="bg-no-charges" />
          <p class="text-no-charges">
            暂无充值套餐
          </p>
        </div>
      </div>
      <div
        class="m-abstract"
        v-else>
        <div class="top-carousel abstract-swiper-wrapper">
          <swiper
            key="test"
            ref="mySwiper"
            :options="swiperOptions"
            class="abstract-carousel-container"
            @tap="showPic(info.goodsPhotoUrlList, swiper.realIndex);"
          >
            <swiper-slide
              v-for="(photoSrc, index) in itemList && itemList.imgList"
              :key="photoSrc"
              class="abstract-slide-wrapper"
            >
              <img
                :src="photoSrc"
                :alt="`goodImg${index}`"
                :style="{width: '100vw', height:'100%'}"
              >
            </swiper-slide>
            <template v-slot:pagination>
              <div
                class="swiper-pagination">
                <span
                  class="swiper-pagination-text"
                >{{ swiperPagination.current }}/{{
                  swiperPagination.total
                }}</span
                >
              </div>
            </template>
          </swiper>
        </div>
        <div class="item-title">
          <p>{{ itemList && itemList.title }}</p>
        </div>
        <div class="item-list">
          <ul class="charges-amount-list">
            <li
              class="charge-item-full"
              v-for="(ele, index) in itemList && itemList.list"
              :key="index">
              <form-radio
                name="game"
                class="charge-item-radio"
                :btn-class="'radio-item-btn'"
                :value="selectGame ? selectGame.goodsId : null"
                @input="selectGameItem($event, ele)"
                :val-code="ele.goodsId">
                <div
                  class="value-wrapper">
                  <template>
                    <div class="data-package">
                      <p class="face-value data-package-item">{{ ele.title }}</p>
                      <p 
                        v-if="ele.discount"
                        class="sale-price data-package-item">{{ ele.amount | formatPrice(false) }}(-{{ ele.discount | formatPrice(false) }}Ks)</p>
                      <p 
                        v-else
                        class="sale-price data-package-item">{{ ele.amount | formatPrice(false) }}Ks</p>
                    </div>
                  </template>
                </div>
              </form-radio>
            </li>
          </ul>
        </div>
        <div class="game-input-box">
          <div
            @click="$refs.inputGame.input.focus();"
            class="input-wrapper"
          >
            <AccountInput
              ref="inputGame"
              :value="accountNum"
              :focused.sync="focused"
              @input="accountInput($event)"
              @change="accountChange"
            />
          </div>
          <span 
            class="address-book-btn" 
            @click="getConcat">
            <i class="ic-address-book" />
          </span>
        </div>
        <p 
          class="phone-num-tips" 
          :class="{ error: error }">
          {{ error || `${contactName} ${tips ? `(${tips})` : ""}` }}
        </p>
      </div>
    </div>
    <footer
      v-if="!hideFooter && itemId"
      class="m-footer"
    >
      <StyledButton
        type="button"
        @click="submit"
        tag="button"
        class="confirm-btn"
        :disabled="isDisabled"
      >Next</StyledButton>
    </footer>
  </form>
</template>

<script>import { constructorMap } from "@/config/macroMap";
import { code, msg } from "@/config/error.js";
import AccountInput from "./AccountInput";
import StyledButton from "@/components/StyledButton.vue";
import ChargesAmountGroup from "./ChargesAmountGroup";
import bridge from "@/modules/bridge";
import { formatPrice } from "@/modules/formatter";
import { computeSucc, dispatchRecharge } from "@/modules/api";
import { isAndroid } from "@/modules/env";
import Popup from "@/components/Popup";
import * as url from "@/modules/url";
import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "@/modules/library/vueAwesomeSwiper";
import FormRadio from "@/components/form/FormRadio.vue";

const img1 = require("@/assets/giftCard/1.jpg");
const img2 = require("@/assets/giftCard/2.jpg");
const img3 = require("@/assets/giftCard/3.jpg");
const img4 = require("@/assets/giftCard/4.jpg");

export default {
  name: "SectionGame",
  components: {
    AccountInput,
    StyledButton,
    ChargesAmountGroup,
    Popup,
    swiper,
    swiperSlide,
    FormRadio
  },
  props: {
    precondition: {
      type: Object,
      default: null,
    },
    supportType: {
      type: [Number, String],
      default: null,
    },
    chargeType: {
      type: [Number, String],
      default: 11,
    }
  },
  data() {
    const tencentIds = [1, 2, 9, 10];// 腾讯系的 categoryId
    return {
      tencentIds,
      loading: true,
      mealList: [],
      chargeList: [],
      isServerValid: false,
      selectedMeal: null,
      //充值种类
      gameType: undefined,
      //请求数据参数
      reqToken: "",
      osCode: "",
      //输入框相关
      accountNum: "",
      contactName: "",
      error: "",
      tips: "",
      focused: false,
      //区服弹窗
      districtDialogShow: false,
      //区服弹窗list
      selectDistrictList: [],
      //为true表示2级弹窗
      selectDistrictType: false,
      //是否显示充值区服
      selectDistrictShow: false,
      chargeItemList: [],
      swiperOptions: {
        loop: true,
        wrapperClass: "abstract-carousel-wrapper",
        speed: 200,
        pagination: {
          el: ".swiper-pagination",
          type: "custom",
          renderCustom: (swiper, current, total) => {
            this.swiperPagination.current = current;
            this.swiperPagination.total = total;
          }
        }
      },
      swiperPagination: {
        current: 0,
        total: 0
      },
      selectGame: null
    };
  },
  watch: {
    precondition: {
      handler(val) {
        if (val) {
          this.init();
        }
      },
      immediate: true,
    },
    gameType: {
      handler() {

      },
    },
    chargeType: {
      handler(val) {
        if (val) {
          this.init();
        }
      }
    }
  },
  computed: {
    baseUrl() {
      return process.env.BASE_URL;
    },
    isAndroid() {
      return isAndroid();
    },
    //充值按钮是否可以点击
    isDisabled() {
      return !this.accountNum 
        || !!this.error || !this.selectGame;
    },
    hideFooter() {
      return this.isAndroid && this.focused;
    },
    price() {
      return (this.selectedMeal && this.selectedMeal.salePrice) || 0;
    },
    itemId() {
      return url.getParam("itemId");
    },
    itemList() {
      return this.chargeList.find(item => `${item.id}` === this.itemId);
    },
  },
  methods: {
    //token改变加载页面数据设置请求参数
    async init() {
      this.$tips.showLoading();
      this.accountNum = "";
      this.reqToken = this.precondition.requestToken;
      this.osCode = this.precondition.osCode;
      await this.getData();
    },
    //获取充值类型数据并处理
    async getData() {
      this.loading = true;
      await this.getChargesList().then(res => {
        let { itemVOList } = res;
        this.chargeList = [...itemVOList];
      }).finally(() => {
        this.$tips.removeLoading();
      });
      this.loading = false;
    },
    //获取充值类型data
    async getChargesList() {
      try {
        return new Promise((resolve) => {
          let result = [
            {categoryId: 11, title: "Discount", itemVOList: [
              {id: 2021092911, title: "PES 2020(SGD)", subtitle: "PES 2021 subtitle", imgUrl: img1, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD", activityDescption: "" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ] },
              {id: 2021092912, title: "PES 2020", subtitle: "PES 2022 subtitle", imgUrl: img2, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092913, title: "PES 2020", subtitle: "PES 2023 subtitle", imgUrl: img3, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092914, title: "PES 2020", subtitle: "PES 2024 subtitle", imgUrl: img4, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092915, title: "PES 2020", subtitle: "PES 2025 subtitle", imgUrl: img1, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092916, title: "PES 2020", subtitle: "PES 2026 subtitle", imgUrl: img2, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092917, title: "PES 2020", subtitle: "PES 2027 subtitle", imgUrl: img3, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092918, title: "PES 2020", subtitle: "PES 2028 subtitle", imgUrl: img4, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092919, title: "PES 2020", subtitle: "PES 2029 subtitle", imgUrl: img1, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
              {id: 2021092910, title: "PES 2020", subtitle: "PES 2020 subtitle", imgUrl: img2, imgList: [img1, img2, img3, img4], list: [
                {goodsId: 202109291110, discount: 214000, amount:  234000, title: "1SGD" },
                {goodsId: 202109291111, discount: 312000, amount:  324000, title: "2SGD" },
                {goodsId: 202109291112, discount: 309000, amount:  314000, title: "3SGD" },
                {goodsId: 202109291113, discount: 285000, amount:  299000, title: "4SGD" },
                {goodsId: 202109291114, discount: 266000, amount:  288000, title: "5SGD" },
              ]  },
            ]},
            {
              categoryId: 12, title: "Normal", itemVOList: [
                {id: 2021092911, title: "PES 2020", subtitle: "PES 2020 normal subtitle", imgUrl: img4, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD-N" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD-N" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD-N" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD-N" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD-N" },
                ]  },
                {id: 2021092912, title: "PES 2021", subtitle: "PES 2020 normal subtitle", imgUrl: img2, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD-N" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD-N" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD-N" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD-N" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD-N" },
                ]   },
                {id: 2021092913, title: "PES 2022", subtitle: "PES 2020 normal subtitle", imgUrl: img3, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD-N" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD-N" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD-N" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD-N" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD-N" },
                ]   },
                {id: 2021092914, title: "PES 2023", subtitle: "PES 2020 normal subtitle", imgUrl: img1, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD-N" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD-N" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD-N" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD-N" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD-N" },
                ]   },
                {id: 2021092915, title: "PES 2024", subtitle: "PES 2020 normal subtitle", imgUrl: img1, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD-N" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD-N" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD-N" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD-N" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD-N" },
                ]   },
                {id: 2021092916, title: "PES 2025", subtitle: "PES 2020 normal subtitle", imgUrl: img2, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD" },
                ]   },
                {id: 2021092917, title: "PES 2026", subtitle: "PES 2020 normal subtitle", imgUrl: img3, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD" },
                ]   },
                {id: 2021092918, title: "PES 2027", subtitle: "PES 2020 normal subtitle", imgUrl: img4, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD" },
                ]   },
                {id: 2021092919, title: "PES 2028", subtitle: "PES 2020 normal subtitle", imgUrl: img1, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD" },
                ]   },
                {id: 2021092910, title: "PES 2029", subtitle: "PES 2020 normal subtitle", imgUrl: img2, imgList: [img1, img2, img3, img4], list: [
                  {goodsId: 202109291110, amount:  234000, title: "1SGD" },
                  {goodsId: 202109291111, amount:  324000, title: "2SGD" },
                  {goodsId: 202109291112, amount:  314000, title: "3SGD" },
                  {goodsId: 202109291113, amount:  299000, title: "4SGD" },
                  {goodsId: 202109291114, amount:  288000, title: "5SGD" },
                ]   },
              ]
            }
          ];
          let res = result.find(item => `${item.categoryId}` === `${this.chargeType}` );
          resolve(res);
        });
      } catch (err) {
        this.$tips.removeLoading();
        this.$tips.showAlert({
          text: err.errorMessage || msg[err.errorCode || code.NET_ERR]
        });
      }
    },
    /**
     * 选中项目
    */
    selectItem(id) {
      this.gameType = id;
      window.location.href = `${this.baseUrl}/giftcard.html?chargeType=${this.chargeType}&itemId=${id}`;
    },
    /**
     * @param {String} value
     * qq输入框的输入错误验证
     * */
    accountInput(value) {
      if (this.accountNum === value) {
        return;
      }
      this.contactName = "";
      this.accountNum = value;
      this.error = "";
      this.tips = "";
    },
    //验证qq账号是否正确
    accountChange(info) {
      if (this.accountNum !== "" && this.accountNum !== undefined && info && !info.isValid) {
        this.error = info.errMsg;
        return null;
      }
    },
    //调用客户端api，全屏显示商品大图
    showPic(list, current) {
      // bridge.showPic({
      //   list: list,
      //   current: current
      // });
    },
    // 获取通讯录
    async getConcat() {
      const [phoneNum, name] = await bridge.getConcatFromAddressBooks();
      this.accountNum = phoneNum.replace(/\D/g, "");
      this.contactName = name;
      this.isServerValid = false;
      this.accountChange();
    },
    selectGameItem(goodsId, item) {
      console.log(item, "itemitem");
      this.selectGame = item;
    },
    //充值提交
    async submit() {
      if (this.isDisabled) {
        return;
      }
      let params = {
        productName: this.selectGame.title,
        goodsId: this.selectGame.goodsId.toString(),
        amount: (this.selectGame.discount || this.selectGame.amount).toString(),
        activity: this.selectGame.activityDescption,
        mobile: this.accountNum.toString(),
        poundage: 0,
      };
      await computeSucc(dispatchRecharge)({params: JSON.stringify(params), version: 1, timestamp: +new Date()}).then(res => {
        const { data } = res;
        console.log(bridge, "bridgebridge");
        const str = `Please confirm purchase\n Confirm the Phone Number\n${this.accountNum}?`;
        this.$tips.showConfirm({text: str}).then(() => {
          bridge.getOrderReq(data).then(res => {
            window.location.href = `${this.baseUrl}/pay-result.html?type=3&goodsName=${params.productName}&amount=${params.amount}&orderNo=${res}`;
          });
        });
      }).finally(() => {

      });
    },
  },
  filters: {
    formatPrice: formatPrice
  },
};
</script>

<style lang="less">
  .game-charge-section {
    /*padding-bottom: .px2rem(40) [];*/
  }
  .game-type {
    padding: 0 .px2rem(20) [];
  }
  .game-type-nav {
    position: relative;
    margin: 0 .px2rem(-10)[];
    box-sizing: border-box;
    .nav-item-box {
      box-sizing: border-box;
      margin-bottom: .px2rem(15) [];
      width: calc(100%/2);
      float: left;
      padding: 0 .px2rem(10)[];
      .nav-item {
        display: inline-block;
        position: relative;
        text-align: center;
        cursor: pointer;
        position: relative;
        padding-bottom: .px2rem(16)[];
        .nav-item-content {
          margin: 0 .px2rem(10)[];
          text-align: left;
          margin-top: .px2rem(5)[];
        }
        .icon {
          border: 1px solid @color-normal;
          border-radius: .px2rem(8) [];
          margin: 0 auto;
          height: .px2rem(148) [];
          .icon-img {
            height: 100%;
            width: 100%;
            object-fit: fill;
            border-radius: .px2rem(8) [];
          }
        }
        .text {
          white-space: nowrap;
          color: @color-font-normal;
          font-size: .px2rem(13)[];
          line-height: .px2rem(20)[];
          user-select: none;
          font-weight: bold;
        }
        .charge-item-amount {
          line-height: .px2rem(20)[];
        }
        .discount {
          display: inline-block;
          background-color: #FF6E66;
          font-size: .px2rem(10)[];
          color: #fff;
          height: .px2rem(10)[];
          line-height: .px2rem(10)[];
          border-radius: .px2rem(2)[];
          padding: .px2rem(3)[] .px2rem(6)[];
          margin-right: .px2rem(6)[];
        }
        .amount {
          display: inline-block;
          line-height: .px2rem(20)[];
          color: #000;
          font-size: .px2rem(11)[];
          font-weight: bold;
        }
      }
      .nav-item.selected {
        .icon {
          border: 1px solid @color-red;
        }
        .text {
          color: @color-red;
        }
      }
    }
  }
  .divide-line {
    height: .px2rem(8) [];
    background-color: #f5f5f5;
  }
  .game-input-box {
    margin: .px2rem(12) [] .px2rem(16) [] 0;
    position: relative;
    display: flex;
    height: .px2rem(48) [];
    background: #E9EDFB;
    opacity: 1;
    border: 1px solid rgba(54, 66, 218, 0.07999999821186066);
    border-radius: 4px 4px 4px 4px;
    .input-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
      flex: 1;
      padding-left: .px2rem(12) [];
      font-size: 0;
    }
    .address-book-btn {
      display: block;
      padding: .px2rem(0) [] .px2rem(12) [];
      height: 100%;
      .ic-address-book {
        display: inline-block;
        width: .px2rem(21.525) [];
        height: 100%;
        background-image: url("~@/assets/recharge/ic-address-book.png");
        background-repeat: no-repeat;
        background-size: .px2rem(21.525) [];
        background-position: center;
      }
    }
  }
  
  .phone-num-tips {
    margin: 0 .px2rem(16) [] .px2rem(20) [];
    flex-basis: .px2rem(15) [];
    line-height: .px2rem(15) [];
    font-size: .px2rem(10) [];
    color: #888;
    &.error {
      color: @color-red;
    }
  }
  .district-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    .f-divide-line(@direction: top, @type: border,@color: #e6e6e6);
    padding: .px2rem(10) [] .px2rem(12) [];
    font-size: 0;
    
    .district-title {
      display: block;
      margin-bottom: .px2rem(4) [];
      font-size: 12px;
      color: #999999;
    }
    
    .district-select {
      font-size: 18px;
      color: #f23030;
      display: flex;
      align-items: center;
    }
    
    .select-icon:after {
      content: '';
      display: inline-block;
      position: relative;
      top: -2px;
      left: 5px;
      width: 6px;
      height: 6px;
      border-top: 1px solid #f23030;
      border-right: 1px solid #f23030;
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
    }
  }
  .recharge-wrapper {
    padding: .px2rem(18) [] .px2rem(12) [] .px2rem(25) [];
    .f-divide-line(@direction: top, @type: border,@color: #e6e6e6);
    
    .recharge-title {
      color: #222222;
      font-family: PingFangSC-Regular;
      font-size: .px2rem(18) [];
    }
    
    .recharge-type {
      .charges-amount-group {
        padding: 0;
      }

      .charge-item {
        margin-top: .px2rem(22) [];
      }

      .charge-item-radio .radio-item-btn {
        height: .px2rem(45) [];
      }
    }
  }
  .charge-content {
    .f-divide-line(@direction: top, @type: border,@color: #e6e6e6);
    padding: .px2rem(20) [] .px2rem(12) [];
    .bg-no-charges {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin-top: .px2rem(30) [];
      height: .px2rem(100) [];
      background: url("~@/assets/recharge/bg-no-recharge.png") no-repeat
        center/.px2rem(100) [];
    }
    .text-no-charges {
      font-size: 15px;
      color: #999;
      text-align: center;
    }
  }
  .m-footer {
    bottom: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    padding: 0 .px2rem(15) [] .px2rem(9.5) [];
    background: white;
    font-size: 0;
    user-select: none;
    .confirm-btn {
      .f-pingfang-semibold();
      line-height: .px2rem(44) [];
      height: .px2rem(44) [];
      font-size: .px2rem(17) [];
    }
  }
  .charge-item-subtitle {
    line-height: .px2rem(20) [];
    color: #8F92A1;
    font-family: PingFangHK-Regular;
    font-size: .px2rem(9) [];
  }
  .m-abstract {
    padding: 0;
    margin: 0;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    height: 100vh;
    .f-flex-column-100per-H() {
      display: flex;
      flex-direction: row;
      height: auto;
    }
    .abstract-swiper-wrapper {
      display: flex;
      flex: 1;
      background: #f5f5f5;
    }
    //第三方轮播图组件样式覆盖
    .abstract-carousel-container {
      flex: 1;
      z-index: initial;
      height: 100%;
      .abstract-carousel-wrapper {
        display: flex;
        transition-timing-function: ease-in-out;
        transition-property: transform;
        height: 100%;
      }

      .abstract-slide-wrapper {
        align-items: stretch;
        height: 100%;
      }
    }
    .swiper-pagination {
      position: absolute;
      left: initial;
      bottom: .px2rem(12) [];
      right: .px2rem(12) [];
      padding: .px2rem(3) [] .px2rem(9) [];
      font-size: 0;
      color: white;
      height: .px2rem(20) [];
      width: auto;
      box-sizing: border-box;
      background: #b2b2b2;
      border-radius: .px2rem(50) [];
      z-index: auto;
      .swiper-pagination-text {
        font-size: .px2rem(11) [];
        line-height: .px2rem(15) [];
      }
    }
    .abstract-price-line {
      .f-sf-pro-text-semibold();
      box-sizing: border-box;
      padding: .px2rem(6) [] .px2rem(12) [];
      background: white;
      .promote-activity-price-label {
        vertical-align: middle;
        margin-right: .px2rem(5) [];
        padding: .px2rem(2) [] .px2rem(5) [];
        height: .px2rem(19) [];
        background: @color-red;
        border-radius: .px2rem(1) [];
        font-size: 12px;
        color: white;
      }
      .tag-price {
        vertical-align: middle;
        margin-left: .px2rem(3.5) [];
        .f-sf-pro-text-regular();
        font-size: 13px;
        color: #888;
      }
    }
    .item-title {
      padding: .px2rem(20) [] 0;
      p {
        color: #9795A4;
        font-size: .px2rem(14) [];
        line-height: .px2rem(22) [];
        text-align: center;
      }
    }
    .item-list {
      padding: 0 .px2rem(16) [];
      .charges-amount-list {
        margin: .px2rem(-10) [] .px2rem(-10) [] 0;
      }
      .charge-item {
        display: inline-block;
        vertical-align: bottom;
        width: calc(100%/3);
        box-sizing: border-box;
        padding: 0 .px2rem(10) [];
        margin-top: .px2rem(10) [];
        position: relative;
      }
      .charge-item-full {
        display: inline-block;
        vertical-align: bottom;
        width: 100%;
        box-sizing: border-box;
        padding: 0 .px2rem(10) [];
        margin-top: .px2rem(10) [];
        position: relative;
      }
      .charge-item-radio {
        display: block;
        width: 100%;
        height: .px2rem(48) [];
        .radio-item-btn {
          width: 100%;
          height: .px2rem(48) [];
          border-radius: .px2rem(6) [];
          border: 1px solid #d9d9d9;
          &[checked] {
            background: #ffffff;
            color: @color-select;
            border: 1px solid @color-select;
            .sale-price, .face-value {
              color: @color-select !important;
            }
          }
          &[disabled]{
            color: #AAA;
          }
        }
      }
      .data-package {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .data-package-item {
          margin: 0px !important;
        }
      }
      .value-wrapper{
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        .face-value {
          [disabled] &{
            margin: 0;
          }
          margin-top: .px2rem(9) [];
          line-height: .px2rem(20) [];
          font-size: .px2rem(14) [];
          white-space: nowrap;
          .f-sf-pro-text-semibold();
          color: #333;
        }
        .sale-price {
          vertical-align: middle;
          font-size: .px2rem(14) [];
          line-height: .px2rem(20) [];
          color: #626262;
          word-break: break-all;
        }
      }
    }
  }

</style>