<template>
  <div class="space-y-4">
    <el-upload
      v-model:file-list="fileList"
      :http-request="uploadImage"
      multiple
      :show-file-list="false"
      :before-upload="beforeUpload"
    >
      <el-button type="primary" :icon="Plus">添加图片</el-button>
    </el-upload>
    
    <!-- 预览区域 -->
    <div v-if="fileList.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="(file, index) in fileList"
        :key="index"
        class="relative aspect-square rounded-lg overflow-hidden group"
      >
        <img
          :src="getPreviewUrl(file)"
          class="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
        
        <!-- 上传进度 -->
        <div
          v-if="file.status === 'uploading'"
          class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <el-progress
            type="circle"
            :percentage="file.percentage || 0"
            :width="40"
            :stroke-width="4"
            color="white"
          />
        </div>
        
        <!-- 删除按钮 -->
        <div
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <el-button
            type="danger"
            :icon="Delete"
            circle
            size="small"
            @click="removeImage(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import imageCompression from 'browser-image-compression'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const fileList = ref([])
const previewUrls = ref(new Map())

// 获取预览 URL
const getPreviewUrl = (file) => {
  if (file.url) return file.url
  if (!file.raw) return ''
  
  if (!previewUrls.value.has(file.raw)) {
    const url = URL.createObjectURL(file.raw)
    previewUrls.value.set(file.raw, url)
  }
  return previewUrls.value.get(file.raw)
}

const beforeUpload = async (file) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只能上传 JPG/PNG/GIF 格式的图片!')
    return false
  }
  
  // 检查文件大小（10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  
  // 压缩图片
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
  
  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('压缩图片失败:', error)
    ElMessage.error('图片压缩失败')
    return false
  }
}

// 清理文件名，移除特殊字符
const sanitizeFileName = (name) => {
  // 移除文件扩展名
  const ext = name.split('.').pop()
  // 生成纯数字和字母的文件名
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  // 确保扩展名只包含字母
  const safeExt = ext.replace(/[^a-zA-Z]/g, '')
  // 返回安全的文件名（只包含数字、字母和点）
  return `${timestamp}_${randomStr}.${safeExt}`
}

const uploadImage = async ({ file }) => {
  // 创建新的文件对象
  const newFile = {
    raw: file,
    status: 'uploading',
    percentage: 0
  }
  fileList.value.push(newFile)
  const fileIndex = fileList.value.length - 1

  try {
    const fileName = sanitizeFileName(file.name)
    console.log('开始上传文件:', fileName)
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (fileList.value[fileIndex]) {
            fileList.value[fileIndex].percentage = Math.round(
              (progress.loaded / progress.total) * 100
            )
          }
        }
      })
      
    if (error) {
      console.error('上传错误:', error)
      throw error
    }
    
    console.log('上传成功:', data)
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)
      
    console.log('文件公开URL:', publicUrl)
    
    if (fileList.value[fileIndex]) {
      fileList.value[fileIndex].url = publicUrl
      fileList.value[fileIndex].status = 'success'
    }
    
    const urls = fileList.value
      .filter(file => file.status === 'success')
      .map(file => file.url)
    emit('update:modelValue', urls)
    
  } catch (error) {
    console.error('处理上传时发生错误:', error)
    ElMessage.error('图片上传失败: ' + (error.message || '未知错误'))
    if (fileList.value[fileIndex]) {
      fileList.value[fileIndex].status = 'error'
    }
  }
}

const removeImage = (index) => {
  fileList.value.splice(index, 1)
  const urls = fileList.value
    .filter(file => file.status === 'success')
    .map(file => file.url)
  emit('update:modelValue', urls)
}

// 组件卸载时清理 URL
onUnmounted(() => {
  previewUrls.value.forEach(url => {
    URL.revokeObjectURL(url)
  })
  previewUrls.value.clear()
})

// 清空文件列表
const clearFiles = () => {
  fileList.value = []
  previewUrls.value.forEach(url => {
    URL.revokeObjectURL(url)
  })
  previewUrls.value.clear()
}

// 暴露方法给父组件
defineExpose({
  clearFiles
})
</script> 