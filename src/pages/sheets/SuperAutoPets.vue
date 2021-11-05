<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Dialog,
  DialogOverlay,
  DialogTitle,
} from '@headlessui/vue'
import data from '@/assets/data.json'
import {
  XIcon,
  SearchCircleIcon,
  ChevronDownIcon,
} from '@heroicons/vue/outline'
import { useGtag } from 'vue-gtag-next'

const router = useRouter()
const route = useRoute()
const gtag = useGtag()

// TODO: move to types
interface Item {
  id: string
  name: string
  imageUrl: string
  tier: number
  tags: string[]
}

interface Animal extends Item {
  packs: number[]
  attack: number
  health: number
  levels: string[]
}

interface Food extends Item {
  description: string
}

const { animals, foods, packs, tiers } = data

const term = ref('')
const normalizedTerm = computed(() => term.value.trim().toLowerCase())

const items = computed<Item[]>(() => [...animals, ...foods] as Item[])

const current = computed<Animal | Food | undefined>(() => {
  const id = route.hash.replace('#', '')
  const item = items.value.find((item) => item.id === id)

  return item && ((item as Animal) ? item as Animal : item as Food)
})

// lock scrolling if we are in a modal
watch(
  () => current.value,
  (value) => {
    document.body.classList.toggle('overflow-hidden', !!value)
  },
  { immediate: true }
)

const closeModal = () => {
  router.push({ query: route.query })
}

const filteredItems = computed(() => {
  // prettier-ignore
  return items.value
    // filter tiers and packs
    .filter((item) =>
      selectedTiers.value.includes(item.tier) &&
      ((item as Animal).packs?.some((pack) =>
        selectedPacks.value.includes(pack)
      ) ?? true)
    )
    // filter text
    .filter((item) =>
      item.name.toLowerCase().includes(normalizedTerm.value) ||
      (item as Animal).levels?.some((level) =>
        level.toLowerCase().includes(normalizedTerm.value)
      ) ||
      (item as Food).description?.toLowerCase().includes(normalizedTerm.value)
    )
})

const itemsByTier = computed(() => {
  return filteredItems.value
    .reduce<Array<{ number: number; animals: Animal[]; foods: Food[] }>>(
      (acc, curr) => {
        if ('levels' in (curr as Animal)) {
          acc[curr.tier].animals.push(curr as Animal)
        } else {
          acc[curr.tier].foods.push(curr as Food)
        }
        return acc
      },
      new Array(tiers.length)
        .fill(0) // need to fill with primitives to avoid cross references
        .map((_, i) => ({ number: i, animals: [], foods: [] }))
    )
    .filter((tier) => tier.animals.length || tier.foods.length)
})

const selectedPacks = ref<number[]>([])

const togglePack = (i: number) => {
  if (selectedPacks.value.includes(i)) {
    selectedPacks.value = selectedPacks.value.filter((t) => t !== i)
  } else {
    selectedPacks.value.push(i)
  }

  gtag.event('toggle_pack', {
    event_category: 'filters',
    event_label: i.toString(),
  })
}

const selectedTiers = ref<number[]>([])

const toggleTier = (i: number) => {
  if (selectedTiers.value.includes(i)) {
    selectedTiers.value = selectedTiers.value.filter((t) => t !== i)
  } else {
    selectedTiers.value.push(i)
  }

  gtag.event('toggle_tier', {
    event_category: 'filters',
    event_label: i.toString(),
  })
}

const reset = () => {
  term.value = ''
  selectedPacks.value = [0, 1]
  selectedTiers.value = [0, 1, 2, 3, 4, 5]
}

watch(
  [term, selectedPacks, selectedTiers],
  ([newTerm, newPacks, newTiers]) => {
    const filtering =
      newTerm.length || newPacks.length !== 2 || newTiers.length !== 6

    router.replace({
      hash: route.hash,
      query: filtering
        ? {
            term: newTerm,
            packs: newPacks.join(','),
            tiers: newTiers.join(','),
          }
        : {},
    })
    console.log()
  },
  { deep: true }
)

watch(
  () => route.hash,
  (hash) => {
    if (hash) {
      gtag.event('view_item', {
        event_category: 'items',
        event_label: hash.replace('#', ''),
      })
    }
  }
)

let termDebounce: ReturnType<typeof setTimeout>
watch(
  () => normalizedTerm.value,
  (value) => {
    clearTimeout(termDebounce)

    if (value) {
      termDebounce = setTimeout(() => {
        gtag.event('search_term', {
          event_category: 'filters',
          event_label: value,
        })
      }, 500)
    }
  }
)

// apply query params on reload
if (route.query.term || route.query.packs || route.query.tiers) {
  term.value = (route.query.term as string) ?? ''

  selectedPacks.value = ((route.query.packs as string) ?? '')
    .split(',')
    .filter(Boolean)
    .map((t) => parseInt(t))

  selectedTiers.value = ((route.query.tiers as string) ?? '')
    .split(',')
    .filter(Boolean)
    .map((t) => parseInt(t))
} else {
  reset()
}
</script>

<template>
  <div class="container mx-auto my-10 px-5">
    <header class="mb-8">
      <h1>Super Auto Pets</h1>
      <a href="https://teamwoodgames.com/" target="_blank" rel="noopener">
        Team Wood Games
      </a>
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
            autofocus
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
                '!bg-primary-500': selectedPacks.length !== packs.length,
              }"
            >
              {{ selectedPacks.length }} / {{ packs.length }}
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
                    :checked="selectedPacks.includes(i)"
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
                '!bg-primary-500': selectedTiers.length !== tiers.length,
              }"
            >
              {{ selectedTiers.length }} / {{ tiers.length }}
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
                    :checked="selectedTiers.includes(i)"
                    @input="toggleTier(i)"
                  />
                  <label :for="`tier-${i}`" class="ml-2 flex-grow">
                    {{ tier }}
                  </label>
                </div>
              </fieldset>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>

      <div class="text-gray-400">
        Showing {{ filteredItems.length }} / {{ items.length }}

        <button
          v-if="filteredItems.length !== items.length"
          class="text-primary-500"
          @click="reset"
        >
          Reset filters
        </button>
      </div>
    </form>

    <div v-if="filteredItems.length === 0" class="text-center">
      <img src="/images/turtle.png" class="inline-block mb-8 w-32 h-32" alt="turtle mascot" />

      <p class="mb-8">No results found, try modifying your search</p>

      <footer>
        <button
          class="
            px-5
            py-3
            rounded-lg
            bg-primary-500
            text-white
            focus:outline-none focus:ring-4
            ring-primary-500/50
            hover:bg-primary-600
          "
          @click="reset"
        >
          Reset filters
        </button>
      </footer>
    </div>

    <section v-for="tier in itemsByTier" :key="tier.number" class="mb-8">
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
                <img :src="animal.imageUrl" class="w-20 h-20 object-contain" :alt="animal.name" />
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

        <li v-for="food in tier.foods" :key="food.id">
          <router-link
            :to="{ query: route.query, hash: `#${food.id}` }"
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
                <img :src="food.imageUrl" class="w-20 h-20 object-contain" :alt="food.name" />
              </div>

              <div class="flex-grow">
                <h3>
                  {{ food.name }}
                </h3>

                <div>{{ tiers[food.tier] }}</div>
              </div>
            </header>

            <hr class="my-3 border-0 h-1 bg-gray-200 rounded-full" />

            <div class="text-sm text-gray-600">
              {{ food.description }}
            </div>
          </router-link>
        </li>
      </ul>
    </section>

    <Dialog
      :open="!!current"
      class="
        flex
        fixed
        inset-0
        px-5
        py-10
        items-center
        justify-center
        overflow-auto
      "
      @close="closeModal"
    >
      <DialogOverlay class="fixed inset-0 bg-black/70" />

      <div
        v-if="current"
        class="
          relative
          p-8
          max-w-xl
          w-full
          bg-white
          rounded-xl
          shadow-xl
          lg:text-lg
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
            <img :src="current.imageUrl" class="w-32 h-32 object-contain" :alt="current.name" />
          </div>

          <div class="flex-grow">
            <h3 class="text-3xl">
              {{ current.name }}
            </h3>

            <div>{{ tiers[current.tier] }}</div>

            <div v-if="'attack' in current && 'health' in current">
              {{ current.attack }}/{{ current.health }}
            </div>
          </div>
        </header>

        <hr class="my-5 border-0 h-1 bg-gray-200 rounded-full" />

        <div>
          <ul v-if="'levels' in current">
            <li v-for="(level, i) in current.levels" :key="i">
              Level {{ i + 1 }} - {{ level }}
            </li>
          </ul>

          <div v-if="'description' in current">
            {{ current.description }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
