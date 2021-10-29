<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '@/assets/data.json'

const term = ref('')

const normalizedTerm = computed(() => term.value.trim().toLowerCase())

// TODO: move to types
interface Animal {
  name: string
  icon: string
  packs: number[]
  tier: number
  attack: number
  health: number
  levels: string[]
  tags: string[]
}

const filteredAnimals = computed(() => {
  return (data.animals as Animal[]).reduce<Animal[]>((acc, curr) => {
    // TODO: search more fields
    return [
      ...acc,
      ...(
        curr.name.toLowerCase().includes(normalizedTerm.value)
        && selectedPacks.value.some((pack) => curr.packs.includes(pack))
          ? [curr]
          : []
      ),
    ]
  }, [])
})

const { packs } = data

const selectedPacks = ref([0, 1])

const togglePack = (i: number) => {
  if (selectedPacks.value.includes(i)) {
    selectedPacks.value = selectedPacks.value.filter((p) => p !== i)
  } else {
    selectedPacks.value.push(i)
  }
}
</script>

<template>
  <div class="container mx-auto px-5">
    <header class="mb-8">
      <h1>Super Auto Pets</h1>
    </header>

    <form class="mb-8">
      <label for="search" class="sr-only"> Search animals and food </label>
      <input
        id="search"
        type="search"
        placeholder="Search animals and food"
        v-model="term"
      />

      <div v-for="(pack, i) in packs" :key="pack.name">
        <input
          :id="`pack-${i}`"
          type="checkbox"
          :checked="selectedPacks.includes(i)"
          @input="togglePack(i)"
        />
        <label :for="`pack-${i}`">{{ pack.name }}</label>
      </div>
    </form>

    <ul class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <li
        v-for="animal in filteredAnimals"
        :key="animal.name"
        class="flex p-3 border rounded"
      >
        <div>
          <span v-html="animal.icon" />
        </div>

        <div>
          <h3>
            {{ animal.name }}
          </h3>

          <div>Tier {{ animal.tier }}</div>

          <div>{{ animal.attack }}/{{ animal.health }}</div>

          <ul>
            <li v-for="(level, i) in animal.levels" :key="i">
              Level {{ i + 1 }} - {{ level }}
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>
