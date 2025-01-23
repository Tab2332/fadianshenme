<template>
  <div class="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md mt-0">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800">每日一句</h2>
      <el-button 
        :icon="Refresh"
        circle
        @click="fetchRandomQuote"
      />
    </div>
    
    <Transition name="fade" mode="out-in">
      <div 
        :key="currentQuote.id" 
        class="text-gray-600 space-y-2 min-h-[80px]"
      >
        <p class="text-lg">{{ currentQuote.content }}</p>
        <p class="text-right text-sm">—— {{ currentQuote.author }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { supabase } from '../supabase'

const currentQuote = ref({ content: '', author: '' })
let timer

const fetchRandomQuote = async () => {
  try {
    // 获取随机的一条记录
    const { data, error } = await supabase
      .from('quotes')
      .select('id, content, author')
      .limit(1)
      .order('id', { ascending: Math.random() > 0.5 })  // 随机升序或降序
      .single()
    
    console.log('查询结果:', { data, error })
    
    if (error) {
      console.error('查询错误:', error)
      currentQuote.value = { content: '加载中...', author: '' }
      return
    }
    
    if (data) {
      console.log('获取到的名言:', data)
      currentQuote.value = data
      // 滚动到底部
      nextTick(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        })
      })
    } else {
      console.log('没有找到名言数据')
      currentQuote.value = { content: '暂无名言', author: '' }
    }
  } catch (err) {
    console.error('执行查询时发生错误:', err)
    console.error('错误详情:', err.message)
    currentQuote.value = { content: '加载失败', author: '' }
  }
}

// 立即获取一次名言
fetchRandomQuote().catch(err => {
  console.error('初始化获取名言失败:', err)
})

onMounted(() => {
  // 页面加载完成后滚动到底部
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
  timer = setInterval(fetchRandomQuote, 30000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script> 