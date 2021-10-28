<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '@/assets/data.json'

const term = ref('')

const normalizedTerm = computed(() => term.value.trim().toLowerCase())

// TODO: move to types
interface Animal {
  name: string
  packs: number[]
  tier: number
  attack: number
  health: number
  levels: string[]
  tags: string[]
}

const filteredAnimals = computed(() => {
  return (data.animals as Animal[]).reduce<Animal[]>((acc, curr) => {
    return [
      ...acc,
      ...(curr.name.toLowerCase().includes(normalizedTerm.value) ? [curr] : []),
    ]
  }, [])
})
</script>

<template>
  <div class="container mx-auto">
    <header>
      <h1>Super Auto Pets</h1>
    </header>

    <form>
      <label for="search" class="sr-only"> Search animals and food </label>
      <input
        id="search"
        type="search"
        placeholder="Search animals and food"
        v-model="term"
      />
    </form>

    <ul>
      <li v-for="animal in filteredAnimals" :key="animal.name">
        <h3>
          {{ animal.name }}
        </h3>
      </li>
    </ul>
  </div>
</template>
