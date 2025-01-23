<template>
  <header class="bg-white sticky top-0 z-50 shadow-sm">
    <div class="container mx-auto px-4 h-full flex items-center justify-between max-w-7xl">
      <!-- 网站标题 -->
      <h1 class="text-2xl font-bold text-gray-800">
        发点什么
      </h1>
    </div>
  </header>
</template>

<script setup>
// import { ref, onMounted } from 'vue'
// import { supabase } from '../supabase'

// const currentQuote = ref({ content: '', author: '' })

// const fetchRandomQuote = async () => {
//   const { data } = await supabase
//     .from('quotes')
//     .select()
//     .limit(1)
//     .single()
//   
//   if (data) {
//     currentQuote.value = data
//   }
// }

// onMounted(() => {
//   fetchRandomQuote()
//   setInterval(fetchRandomQuote, 30000)
// })
</script> 