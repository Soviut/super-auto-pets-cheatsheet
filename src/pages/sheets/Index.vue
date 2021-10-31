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
  <div>
    <header class="mb-8">
      <h1>Sheets</h1>
    </header>

    <ul>
      <li v-for="sheet in sheets" :key="sheet.id">
        <router-link
          :to="{ name: 'sheets-view', params: { sheetid: sheet.id } }"
        >
          {{ sheet.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
