<template>
  <div class="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md mt-4">
    <div class="space-y-4">
      <!-- 搜索输入框 -->
      <el-input
        v-model="searchText"
        placeholder="搜索文章内容..."
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />

      <!-- 日期选择器 -->
      <el-date-picker
        v-model="searchDate"
        type="date"
        placeholder="按日期筛选"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :clearable="true"
        class="w-full"
        @change="handleSearch"
      />

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="space-y-3">
        <div class="text-sm text-gray-500">找到 {{ searchResults.length }} 条结果</div>
        <div v-for="result in searchResults" :key="result.id" 
          class="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
          @click="scrollToArticle(result.id)"
        >
          <div class="text-sm text-gray-600">{{ truncateText(result.content, 100) }}</div>
          <div class="text-xs text-gray-400 mt-1">
            {{ new Date(result.created_at).toLocaleString() }}
          </div>
        </div>
      </div>
      
      <!-- 无结果提示 -->
      <div v-else-if="hasSearched" class="text-center text-gray-500">
        未找到相关文章
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

const searchText = ref('')
const searchDate = ref('')
const searchResults = ref([])
const hasSearched = ref(false)

// 截断文本
const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// 搜索处理
const handleSearch = async () => {
  if (!searchText.value && !searchDate.value) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (searchText.value) {
      query = query.ilike('content', `%${searchText.value}%`)
    }

    if (searchDate.value) {
      const startDate = new Date(searchDate.value)
      const endDate = new Date(searchDate.value)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query.gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    searchResults.value = data
    hasSearched.value = true

  } catch (error) {
    console.error('搜索错误:', error)
    ElMessage.error('搜索失败')
  }
}

// 滚动到对应文章
const scrollToArticle = (articleId) => {
  console.log('尝试跳转到文章:', articleId)
  const article = document.querySelector(`[data-article-id="${articleId}"]`)
  console.log('找到的文章元素:', article)
  
  if (article) {
    // 滚动时添加一些偏移量，避免被顶部导航栏遮挡
    const offset = 80
    const articleTop = article.getBoundingClientRect().top + window.pageYOffset - offset
    
    window.scrollTo({
      top: articleTop,
      behavior: 'smooth'
    })
    
    // 添加高亮效果
    article.style.transition = 'all 0.3s ease'
    article.style.backgroundColor = '#e3f2fd'
    article.classList.add('ring-2', 'ring-blue-500')
    
    // 2秒后移除高亮效果
    setTimeout(() => {
      article.style.backgroundColor = ''
      article.classList.remove('ring-2', 'ring-blue-500')
    }, 2000)
  } else {
    console.log('未找到对应的文章元素')
    ElMessage.warning('未找到对应的文章')
  }
}

// 防抖处理
let searchTimeout
watch(searchText, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(handleSearch, 300)
})
</script> 