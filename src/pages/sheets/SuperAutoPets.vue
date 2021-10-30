<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import data from '@/assets/data.json'
import { XIcon, SearchCircleIcon } from '@heroicons/vue/outline'

const router = useRouter()
const route = useRoute()

// lock scrolling if we are in a modal
watch(
  () => route.params.id,
  (value) => document.body.classList.toggle('overflow-hidden', !!value),
  { immediate: true }
)

const closeModal = () => {
  router.push({ name: 'super-auto-pets' })
}

const term = ref('')

const normalizedTerm = computed(() => term.value.trim().toLowerCase())

// TODO: move to types
interface Animal {
  id: string
  name: string
  imageUrl: string
  packs: number[]
  tier: number
  attack: number
  health: number
  levels: string[]
  tags: string[]
}

const { animals, packs, tiers } = data

const current = computed(() => {
  return (animals as Animal[]).find((animal) => animal.id === route.params.id)
})

// TODO: do text filtering as 2nd step
const filteredAnimals = computed(() => {
  return (animals as Animal[]).reduce<Animal[]>((acc, curr) => {
    return [
      ...acc,
      ...((curr.name.toLowerCase().includes(normalizedTerm.value) ||
        curr.levels.some((level) =>
          level.toLowerCase().includes(normalizedTerm.value)
        )) &&
      curr.packs.some((pack) => selectedPacks.value[pack]) &&
      selectedTiers.value[curr.tier]
        ? [curr]
        : []),
    ]
  }, [])
})

// TODO: return array of objects so empty tiers can be filtered
const animalsByTier = computed(() => {
  return filteredAnimals.value
    .reduce<Array<{ number: number; animals: Animal[] }>>(
      (acc, curr) => {
        acc[curr.tier].animals.push(curr)
        return acc
      },
      new Array(tiers.length)
        .fill(0)
        .map((_, i) => ({ number: i, animals: [] }))
    )
    .filter((tier) => tier.animals.length)
})

const selectedPacks = ref(new Array(packs.length).fill(true))

const togglePack = (i: number) => {
  selectedPacks.value[i] = !selectedPacks.value[i]
}

const selectedTiers = ref(new Array(tiers.length).fill(true))

const toggleTier = (i: number) => {
  selectedTiers.value[i] = !selectedTiers.value[i]
}
</script>

<template>
  <div class="container mx-auto my-10 px-5">
    <header class="mb-8">
      <h1>Super Auto Pets</h1>
    </header>

    <form class="mb-8" @submit.prevent>
      <fieldset
        class="
          grid
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-6
          p-3
          mb-2
          bg-white
          rounded-lg
        "
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
        class="
          grid
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-6
          p-3
          mb-2
          bg-white
          rounded-lg
        "
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
        autocomplete="off"
        v-model="term"
      />

      <div class="text-sm text-gray-400">
        Showing {{ filteredAnimals.length }} / {{ animals.length }}
      </div>
    </form>

    <section v-for="tier in animalsByTier" :key="tier.number" class="mb-8">
      <header class="mb-3">
        <h2>{{ tiers[tier.number] }}</h2>
      </header>

      <ul class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <li v-for="animal in tier.animals" :key="animal.id">
          <router-link
            :to="{ name: 'super-auto-pets-view', params: { id: animal.id } }"
            class="
              block
              h-full
              p-5
              overflow-hidden
              rounded-lg
              bg-white
              text-black
              hover:no-underline hover:ring-4 hover:ring-primary-500/50
              focus:outline-none focus:ring-4 focus:ring-primary-500/50
            "
          >
            <header class="flex gap-3">
              <div class="flex-shrink-0">
                <img :src="`/images/${animal.imageUrl}`" class="w-20" />
              </div>

              <div class="flex-grow">
                <h3>
                  {{ animal.name }}
                </h3>

                <div>{{ tiers[animal.tier] }}</div>

                <div>{{ animal.attack }}/{{ animal.health }}</div>
              </div>
            </header>

            <hr class="my-3 border-0 h-1 bg-gray-200 rounded-full" />

            <div class="text-sm text-gray-600">
              <ul>
                <li v-for="(level, i) in animal.levels" :key="i">
                  Level {{ i + 1 }} - {{ level }}
                </li>
              </ul>
            </div>
          </router-link>
        </li>
      </ul>
    </section>

    <div
      v-if="current"
      class="fixed inset-0 px-5 py-10 bg-black/70"
      @click.self="closeModal"
    >
      <div class="mx-auto p-8 max-w-xl bg-white rounded-xl shadow-xl text-lg">
        <header class="flex gap-5">
          <div class="flex-shrink-0">
            <img :src="`/images/${current.imageUrl}`" class="w-32" />
          </div>

          <div class="flex-grow">
            <h3 class="text-3xl">
              {{ current.name }}
            </h3>

            <div>{{ tiers[current.tier] }}</div>

            <div>{{ current.attack }}/{{ current.health }}</div>
          </div>

          <div class="flex-shrink-0">
            <router-link
              :to="{ name: 'super-auto-pets' }"
              class="
                flex
                -mt-4
                -mr-4
                px-3
                py-2
                items-center
                rounded
                text-base
                focus:outline-none focus:bg-primary-500 focus:text-white
                hover:bg-primary-500 hover:text-white hover:no-underline
                transition
              "
            >
              <XIcon class="w-6 h-6 mr-1" />
              Close
            </router-link>
          </div>
        </header>

        <hr class="my-5 border-0 h-1 bg-gray-200 rounded-full" />

        <div>
          <ul>
            <li v-for="(level, i) in current.levels" :key="i">
              Level {{ i + 1 }} - {{ level }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>