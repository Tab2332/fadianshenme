<template>
  <div class="bg-white rounded-lg shadow-sm p-6 sticky bottom-6">
    <div class="space-y-4">
      <!-- 文章编辑器 -->
      <el-input
        v-model="content"
        type="textarea"
        :rows="4"
        placeholder="写点什么..."
      />
      
      <!-- 图片上传 -->
      <ImageUploader ref="imageUploaderRef" v-model="images" />
      
      <!-- 发布按钮 -->
      <div class="flex justify-end">
        <el-button
          type="primary"
          :loading="publishing"
          @click="publishArticle"
        >
          发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { supabase } from '../supabase'
import ImageUploader from './ImageUploader.vue'

const content = ref('')
const images = ref([])
const publishing = ref(false)
const refreshArticles = inject('refreshArticles')  // 注入刷新方法
const imageUploaderRef = ref(null)

const publishArticle = async () => {
  if (!content.value.trim() && !images.value.length) {
    ElMessage.warning('请输入内容或上传图片')
    return
  }
  
  publishing.value = true
  
  try {
    await supabase
      .from('articles')
      .insert({
        content: content.value,
        images: images.value
      })
      
    content.value = ''
    images.value = []
    // 清空图片预览
    if (imageUploaderRef.value) {
      imageUploaderRef.value.clearFiles()
    }
    ElMessage.success('发布成功')
    
    // 主动刷新文章列表
    if (refreshArticles) {
      await refreshArticles()
    }
    
    // 等待 DOM 更新后滚动到底部
    await nextTick()
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    })
    
  } catch (error) {
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}
</script> 