<template>
  <div class="flex flex-col min-h-screen">
    <header class="px-5 py-3 bg-gray-900">
      <router-link
        :to="{ name: 'home' }"
        class="inline-block text-white hover:no-underline"
      >
        <img src="@/assets/logo.svg" class="inline-block w-10 h-10" />

        <span class="font-light text-xl"> LootSheet </span>
      </router-link>
    </header>

    <main class="flex-grow bg-gray-200">
      <router-view />
    </main>

    <footer class="p-5 bg-gray-300 text-gray-500">&copy; 2021 LootSheet</footer>
  </div>
</template>
