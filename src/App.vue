<template>
  <div>
    <header class="px-5 py-3 bg-gray-900">
      <router-link :to="{ name: 'home' }" class="text-white hover:no-underline">
        <img src="@/assets/logo.svg" class="inline-block w-10 h-10" />

        Lootsheet
      </router-link>
    </header>

    <main>
      <router-view />
    </main>

    <footer>&copy; 2021 Lootsheet</footer>
  </div>
</template>
