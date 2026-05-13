import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/dish/:id',
      name: 'dish-detail',
      component: () => import('@/views/DishDetail.vue'),
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import('@/views/OrderDetail.vue'),
    },
    {
      path: '/orders',
      name: 'order-list',
      component: () => import('@/views/OrderList.vue'),
    },
  ],
});

export default router;