<template>
  <div>
    <header>
      <router-link :to="{ name: 'home' }">
        Lootsheet
      </router-link>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      &copy; 2021 Lootsheet
    </footer>
  </div>
</template>
