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

const { animals, packs, tiers } = data

const filteredAnimals = computed(() => {
  return (animals as Animal[]).reduce<Animal[]>((acc, curr) => {
    // TODO: search more fields
    return [
      ...acc,
      ...(curr.name.toLowerCase().includes(normalizedTerm.value) &&
      curr.packs.some((pack) => selectedPacks.value[pack]) &&
      selectedTiers.value[curr.tier]
        ? [curr]
        : []),
    ]
  }, [])
})

const selectedPacks = ref([true, true])

const togglePack = (i: number) => {
  selectedPacks.value[i] = !selectedPacks.value[i]
}

const selectedTiers = ref([true, true, true, true, true, true])

const toggleTier = (i: number) => {
  selectedTiers.value[i] = !selectedTiers.value[i]
}
</script>

<template>
  <div class="container mx-auto px-5">
    <header class="mb-8">
      <h1>Super Auto Pets</h1>
    </header>

    <form class="mb-8">
      <fieldset
        class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 p-3 mb-2 border rounded"
      >
        <div v-for="(pack, i) in packs" :key="pack">
          <input
            :id="`pack-${i}`"
            type="checkbox"
            :checked="selectedPacks[i]"
            @input="togglePack(i)"
          />
          <label :for="`pack-${i}`" class="ml-2">{{ pack }}</label>
        </div>
      </fieldset>

      <fieldset
        class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 p-3 mb-2 border rounded"
      >
        <div v-for="(tier, i) in tiers" :key="tier">
          <input
            :id="`tier-${i}`"
            type="checkbox"
            :checked="selectedTiers[i]"
            @input="toggleTier(i)"
          />
          <label :for="`tier-${i}`" class="ml-2">{{ tier }}</label>
        </div>
      </fieldset>

      <label for="search" class="sr-only"> Search animals and food </label>
      <input
        id="search"
        type="search"
        placeholder="Search animals and food"
        v-model="term"
      />

      <div>Showing {{ filteredAnimals.length }} / {{ animals.length }}</div>
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

          <div>Tier {{ animal.tier + 1 }}</div>

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
