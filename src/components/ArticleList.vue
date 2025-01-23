<template>
    <div class="space-y-6 w-full">
      <!-- 批量操作栏 -->
      <div v-if="articles.length" class="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center gap-2">
          <el-checkbox
            v-model="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
          <span class="text-sm text-gray-500" v-if="selectedIds.length">
            已选择 {{ selectedIds.length }} 项
          </span>
        </div>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!selectedIds.length"
          @click="confirmBatchDelete"
        >
          批量删除
        </el-button>
      </div>

      <TransitionGroup name="list">
        <article 
          v-for="article in articles" 
          :key="article.id"
          :data-article-id="article.id"
          class="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md relative group"
        >
          <!-- 选择框 -->
          <div class="absolute top-4 left-4">
            <el-checkbox-group v-model="selectedIds">
              <el-checkbox :value="article.id" />
            </el-checkbox-group>
          </div>

          <!-- 操作按钮组 -->
          <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <el-button
              type="primary"
              :icon="Edit"
              circle
              size="small"
              @click="openEditDialog(article)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="confirmDelete(article)"
            />
          </div>

          <div class="flex justify-between items-start mb-4 ml-8">
            <p class="text-gray-600 whitespace-pre-wrap">{{ article.content }}</p>
            <span class="text-sm text-gray-500">
              {{ new Date(article.created_at).toLocaleString() }}
            </span>
          </div>
          
          <!-- 图片网格 -->
          <div 
            v-if="article.images?.length"
            class="flex flex-wrap gap-4 mt-4 ml-8"
          >
            <div 
              v-for="(image, index) in article.images"
              :key="index"
              class="relative w-32 h-32 cursor-pointer"
              @click="() => showImage(image)"
            >
              <img 
                :src="image" 
                class="absolute inset-0 w-full h-full object-cover rounded-lg"
                alt=""
              />
            </div>
          </div>
        </article>
      </TransitionGroup>
      
      <!-- 图片预览 -->
      <vue-easy-lightbox
        :visible="visibleRef"
        :imgs="previewImages"
        :index="indexRef"
        @hide="onHide"
      />

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑文章"
        width="50%"
        :close-on-click-modal="false"
      >
        <div class="space-y-4">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="4"
            placeholder="写点什么..."
          />
          
          <ImageUploader v-model="editForm.images" />
        </div>
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit" :loading="submitting">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="deleteDialogVisible"
        :title="selectedIds.length > 0 ? '批量删除' : '删除'"
        width="30%"
      >
        <span>{{ selectedIds.length > 0 ? `确定要删除选中的 ${selectedIds.length} 条内容吗？` : '确定要删除这条内容吗？' }}</span>
        <template #footer>
          <div class="flex justify-end gap-2">
            <el-button @click="deleteDialogVisible = false">取消</el-button>
            <el-button 
              type="danger" 
              @click="selectedIds.length > 0 ? submitBatchDelete() : submitDelete()" 
              :loading="submitting"
            >
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>

  <script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { Edit, Delete } from '@element-plus/icons-vue'
  import { supabase } from '../supabase'
  import { ElMessage } from 'element-plus'
  import ImageUploader from './ImageUploader.vue'

  const articles = ref([])
  const visibleRef = ref(false)
  const indexRef = ref(0)
  const previewImages = ref([])

  // 多选相关
  const selectedIds = ref([])
  const isAllSelected = computed({
    get: () => selectedIds.value.length === articles.value.length && articles.value.length > 0,
    set: (val) => {
      selectedIds.value = val ? articles.value.map(article => article.id) : []
    }
  })
  const isIndeterminate = computed(() => {
    return selectedIds.value.length > 0 && selectedIds.value.length < articles.value.length
  })

  // 全选/取消全选
  const handleSelectAll = (val) => {
    selectedIds.value = val ? articles.value.map(article => article.id) : []
  }

  // 编辑相关
  const editDialogVisible = ref(false)
  const editForm = ref({
    id: null,
    content: '',
    images: []
  })

  // 删除相关
  const deleteDialogVisible = ref(false)
  const articleToDelete = ref(null)

  // 加载状态
  const submitting = ref(false)

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      articles.value = data
      // 清空选中状态
      selectedIds.value = []
      
    } catch (error) {
      console.error('获取文章失败:', error)
      ElMessage.error('获取文章失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (article) => {
    editForm.value = {
      id: article.id,
      content: article.content,
      images: article.images || []
    }
    editDialogVisible.value = true
  }

  // 提交编辑
  const submitEdit = async () => {
    if (!editForm.value.content.trim() && !editForm.value.images.length) {
      ElMessage.warning('请输入内容或上传图片')
      return
    }

    submitting.value = true
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          content: editForm.value.content,
          images: editForm.value.images
        })
        .eq('id', editForm.value.id)

      if (error) throw error

      ElMessage.success('更新成功')
      editDialogVisible.value = false
      await fetchArticles()
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error('更新失败')
    } finally {
      submitting.value = false
    }
  }

  // 确认删除
  const confirmDelete = (article) => {
    articleToDelete.value = article
    deleteDialogVisible.value = true
  }

  // 提交删除
  const submitDelete = async () => {
    if (!articleToDelete.value) return
    
    submitting.value = true
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleToDelete.value.id)

      if (error) throw error

      ElMessage.success('删除成功')
      deleteDialogVisible.value = false
      await fetchArticles()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    } finally {
      submitting.value = false
      articleToDelete.value = null
    }
  }

  // 确认批量删除
  const confirmBatchDelete = () => {
    if (selectedIds.value.length === 0) return
    deleteDialogVisible.value = true
  }

  // 提交批量删除
  const submitBatchDelete = async () => {
    if (selectedIds.value.length === 0) return
    
    submitting.value = true
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', selectedIds.value)

      if (error) throw error

      ElMessage.success('删除成功')
      deleteDialogVisible.value = false
      await fetchArticles()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    } finally {
      submitting.value = false
      selectedIds.value = []
    }
  }

  // 监听文章列表变化，自动滚动到底部
  watch(articles, (newArticles, oldArticles) => {
    if (newArticles?.length > oldArticles?.length) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, { deep: true })

  // 图片预览相关方法
  const showImage = (image) => {
    indexRef.value = 0
    previewImages.value = [image]
    visibleRef.value = true
  }

  const onHide = () => {
    visibleRef.value = false
  }

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }

  // 暴露刷新方法给父组件
  defineExpose({
    refreshArticles: fetchArticles
  })

  onMounted(async () => {
    await fetchArticles()
    scrollToBottom()
  })
  </script>

  <style scoped>
  :deep(article) {
    transition: all 0.3s ease;
  }
  
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  </style>