<script setup lang="ts">
interface Sheet {
  id: string
  name: string
  imageUrl: string
}

const sheets: Sheet[] = [
  {
    id: 'super-auto-pets',
    name: 'Super Auto Pets',
    imageUrl: '/images/turtle.png',
  },
]
</script>

<template>
  <div class="container mx-auto my-10 px-5">
    <header class="mb-8">
      <h1>Sheets</h1>
    </header>

    <ul class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <li v-for="sheet in sheets" :key="sheet.id">
        <router-link
          :to="{ name: 'sheets-view', params: { sheetid: sheet.id } }"
          class="
            flex
            gap-5
            p-5
            items-center
            rounded-lg
            bg-white
            text-black
            hover:no-underline hover:ring-4 hover:ring-primary-500/50
            focus:outline-none focus:ring-4 focus:ring-primary-500/50
          "
        >
          <img :src="sheet.imageUrl" class="w-16" />

          {{ sheet.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
