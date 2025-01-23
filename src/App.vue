<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- 顶部区域 -->
    <TheHeader class="h-[60px] shadow-sm" />
    
    <!-- 主体区域 -->
    <main class="flex-1 container mx-auto px-4 pt-6 pb-24 flex flex-col lg:flex-row gap-6 max-w-7xl">
      <!-- 左侧文章列表 -->
      <div class="lg:w-[70%] w-full space-y-6">
        <ArticleList ref="refreshArticlesRef" />
      </div>
      
      <!-- 右侧名言面板 -->
      <div class="lg:w-[30%] w-full">
        <div class="lg:sticky lg:top-[84px]">
          <QuotePanel />
          <SearchPanel />
        </div>
      </div>
    </main>
    
    <!-- 底部编辑区 -->
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <ArticleEditor />
    </div>
  </div>
</template>

<script setup>
import { provide, ref } from 'vue'
import TheHeader from './components/TheHeader.vue'
import ArticleList from './components/ArticleList.vue'
import QuotePanel from './components/QuotePanel.vue'
import SearchPanel from './components/SearchPanel.vue'
import ArticleEditor from './components/ArticleEditor.vue'

// 创建一个 ref 来存储 ArticleList 组件的刷新方法
const refreshArticlesRef = ref(null)

// 提供刷新方法给子组件
provide('refreshArticles', () => {
  if (refreshArticlesRef.value?.refreshArticles) {
    return refreshArticlesRef.value.refreshArticles()
  }
})
</script> 