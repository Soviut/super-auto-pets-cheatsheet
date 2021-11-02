<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import data from '@/assets/data.json'
import {
  XIcon,
  SearchCircleIcon,
  ChevronDownIcon,
} from '@heroicons/vue/outline'

const router = useRouter()
const route = useRoute()

const closeModal = () => {
  router.push({ query: route.query })
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
  return (animals as Animal[]).find(
    (animal) => animal.id === route.hash.replace('#', '')
  )
})

// lock scrolling if we are in a modal
watch(
  () => current.value,
  (value) => {
    document.body.classList.toggle('overflow-hidden', !!value)
  },
  { immediate: true }
)

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

const selectedPacks = ref<boolean[]>([])
const selectedPacksCount = computed(
  () => selectedPacks.value.filter((pack) => pack).length
)
const selectedPacksIndexes = computed(() =>
  selectedPacks.value.reduce<number[]>(
    (acc, curr, i) => (curr ? [...acc, i] : acc),
    []
  )
)

const togglePack = (i: number) => {
  selectedPacks.value[i] = !selectedPacks.value[i]
}

const selectedTiers = ref<boolean[]>([])
const selectedTiersCount = computed(
  () => selectedTiers.value.filter((tier) => tier).length
)
const selectedTiersIndexes = computed(() =>
  selectedTiers.value.reduce<number[]>(
    (acc, curr, i) => (curr ? [...acc, i] : acc),
    []
  )
)

const toggleTier = (i: number) => {
  selectedTiers.value[i] = !selectedTiers.value[i]
}

const reset = () => {
  console.log('reset')
  term.value = ''
  selectedPacks.value = new Array(packs.length).fill(true)
  selectedTiers.value = new Array(tiers.length).fill(true)
}

watch(
  [term, selectedPacks, selectedTiers],
  ([term, packs, tiers]) => {
    const filtering =
      term.length ||
      selectedPacksCount.value !== packs.length ||
      selectedTiersCount.value !== tiers.length

    router.replace({
      hash: route.hash,
      query: filtering
        ? {
            term,
            packs: selectedPacksIndexes.value.join(','),
            tiers: selectedTiersIndexes.value.join(','),
          }
        : {},
    })
  },
  { deep: true }
)

// apply query params on reload
if (route.query.term || route.query.packs || route.query.tiers) {
  console.log(route.query.term, route.query.packs, route.query.tiers)
  term.value = (route.query.term as string) ?? ''

  const packIndexes = ((route.query.packs as string) ?? '')
    .split(',')
    .filter(Boolean)
    .map((t) => parseInt(t))
  selectedPacks.value = (new Array(2).fill(0)).map((_, i) =>
    packIndexes.includes(i)
  )

  const tierIndexes = ((route.query.tiers as string) ?? '')
    .split(',')
    .filter(Boolean)
    .map((t) => parseInt(t))
  selectedTiers.value = (new Array(6).fill(0)).map((_, i) =>
    tierIndexes.includes(i)
  )

  console.log(term, selectedPacks.value, selectedTiers.value)
} else {
  reset()
}
</script>

<template>
  <div class="container mx-auto my-10 px-5">
    <header class="mb-8">
      <h1>Super Auto Pets</h1>
    </header>

    <form class="mb-8" @submit.prevent>
      <div class="mb-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="md:col-span-2">
          <label for="search" class="sr-only"> Search animals and food </label>
          <input
            id="search"
            type="search"
            placeholder="Search animals and food"
            autocomplete="off"
            v-model="term"
          />
        </div>

        <Popover class="relative" v-slot="{ open }">
          <PopoverButton
            class="
              flex
              items-center
              px-5
              py-3
              w-full
              bg-white
              rounded-lg
              focus:outline-none focus:ring-4 focus:ring-primary-500/50
            "
            :class="{ 'rounded-b-none ': open }"
          >
            <div>Packs</div>

            <div
              class="ml-2 px-2 py-1 rounded-full bg-gray-400 text-white text-xs"
              :class="{
                '!bg-primary-500': selectedPacksCount !== packs.length,
              }"
            >
              {{ selectedPacksCount }} / {{ packs.length }}
            </div>

            <ChevronDownIcon class="w-5 h-5 ml-auto text-gray-500" />
          </PopoverButton>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-y-1 opacity-100"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <PopoverPanel class="absolute z-10 w-full">
              <fieldset
                class="p-5 bg-white rounded-b-lg shadow-lg space-y-2 border-t"
              >
                <div
                  v-for="(pack, i) in packs"
                  :key="pack"
                  class="flex items-center"
                >
                  <input
                    :id="`pack-${i}`"
                    type="checkbox"
                    :checked="selectedPacks[i]"
                    @input="togglePack(i)"
                  />
                  <label :for="`pack-${i}`" class="ml-2 flex-grow">{{
                    pack
                  }}</label>
                </div>
              </fieldset>
            </PopoverPanel>
          </transition>
        </Popover>

        <Popover class="relative" v-slot="{ open }">
          <PopoverButton
            class="
              flex
              items-center
              px-5
              py-3
              w-full
              bg-white
              rounded-lg
              focus:outline-none focus:ring-4 focus:ring-primary-500/50
            "
            :class="{ 'rounded-b-none ': open }"
          >
            <div>Tiers</div>

            <div
              class="ml-2 px-2 py-1 rounded-full bg-gray-400 text-white text-xs"
              :class="{
                '!bg-primary-500': selectedTiersCount !== tiers.length,
              }"
            >
              {{ selectedTiersCount }} / {{ tiers.length }}
            </div>

            <ChevronDownIcon class="w-5 h-5 ml-auto text-gray-500" />
          </PopoverButton>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-y-1 opacity-100"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <PopoverPanel class="absolute z-10 w-full">
              <fieldset
                class="p-5 bg-white rounded-b-lg shadow-lg space-y-2 border-t"
              >
                <div
                  v-for="(tier, i) in tiers"
                  :key="tier"
                  class="flex items-center"
                >
                  <input
                    :id="`tier-${i}`"
                    type="checkbox"
                    :checked="selectedTiers[i]"
                    @input="toggleTier(i)"
                  />
                  <label :for="`tier-${i}`" class="ml-2 flex-grow">{{
                    tier
                  }}</label>
                </div>
              </fieldset>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>

      <div class="text-sm text-gray-400">
        Showing {{ filteredAnimals.length }} / {{ animals.length }}

        <button
          v-if="filteredAnimals.length !== animals.length"
          class="text-primary-500"
          @click="reset"
        >
          Reset
        </button>
      </div>
    </form>

    <section v-for="tier in animalsByTier" :key="tier.number" class="mb-8">
      <header class="mb-3">
        <h2>{{ tiers[tier.number] }}</h2>
      </header>

      <ul class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <li v-for="animal in tier.animals" :key="animal.id">
          <router-link
            :to="{ query: route.query, hash: `#${animal.id}` }"
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
      <div
        class="
          relative
          mx-auto
          p-8
          max-w-xl
          bg-white
          rounded-xl
          shadow-xl
          text-lg
        "
      >
        <router-link
          :to="{ query: route.query }"
          class="
            absolute
            right-2
            top-2
            z-10
            inline-block
            p-1
            rounded-lg
            text-base
            focus:outline-none focus:bg-primary-500 focus:text-white
            hover:bg-primary-500 hover:text-white hover:no-underline
            transition
          "
        >
          <XIcon class="w-6 h-6" />
          <span class="sr-only">Close</span>
        </router-link>

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
