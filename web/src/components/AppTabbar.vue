<template>
  <VanTabbar v-model="active" route active-color="var(--color-primary)">
    <VanTabbarItem to="/" icon="home-o">菜单</VanTabbarItem>
    <VanTabbarItem to="/orders" icon="bill-o">订单</VanTabbarItem>
  </VanTabbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant';

const active = ref(0);
</script>
