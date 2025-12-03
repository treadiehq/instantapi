<template>
  <div class="min-h-screen relative">
    <div class="radial-gradient absolute top-0 md:right-14 right-5"></div>
    
    <!-- Public Header -->
    <header class="border-b border-gray-500/20 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div class="flex items-center justify-between h-12">
          <div class="flex items-center space-x-3">
            <img src="/logo.png" alt="Instant API" class="w-6 h-6" />
            <h1 class="text-base font-medium text-white">Instant API</h1>
          </div>
          <nav class="flex items-center space-x-4">
            <a href="https://github.com/treadiehq/instantapi" class="text-gray-500 hover:text-white transition-colors cursor-pointer" title="GitHub" target="_blank" rel="noopener noreferrer">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                </svg>
            </a>
            <NuxtLink to="/login" class="text-sm btn-secondary py-1.5! px-4!">
              Sign in
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div class="max-w-7xl mx-auto">
        <!-- Hero Section -->
        <div class="mt-6 md:mt-12 max-w-4xl mb-12">
          <h1 class="mb-5 text-3xl font-bold sm:mb-6 sm:text-5xl leading-tight text-white">
            Run <span class="text-blue-300">AI agents</span> with an API.
          </h1>
          <p class="text-gray-400 text-sm leading-[1.6] sm:text-base">
            The fastest way to turn your AI agents, functions, code, and scripts into APIs. No servers, no infrastructure, no DevOps.
          </p>
        </div>
        
        <!-- Split Screen Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Main Card -->
          <div>
            <div class="border bg-gray-500/5 border-gray-500/15 relative inner-container -mb-px -ml-px">
              <div class="border border-t-0 border-l-0 border-r-0 border-gray-500/10">
                <div>
                  <!-- Example Selector -->
                  <div class="p-4 border-b border-gray-500/10">
                    <div>
                      <div class="relative">
                        <select
                          v-model="selectedExampleValue"
                          @change="loadExample(($event.target as HTMLSelectElement).value)"
                          :disabled="loading.create"
                          class="block w-full appearance-none rounded-lg bg-gray-500/5 py-2.5 pl-4 pr-10 text-sm font-medium text-white border border-gray-500/10 hover:bg-gray-500/15 focus:outline-none focus:ring-2 focus:ring-gray-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 [&>option]:bg-black [&>option]:text-white [&>option:checked]:bg-blue-300 [&>option:checked]:text-white"
                        >
                          <option value="" class="bg-black text-white">Select an example...</option>
                          <option v-for="(example, idx) in examples" :key="idx" :value="String(idx)" class="bg-black text-white">
                        {{ example.name }}
                      </option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-0">
                          <svg class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Code Editor -->
                  <div class="bg-black relative">
                    <!-- Fullscreen Toggle Button -->
                    <button
                      @click="isEditorFullscreen = !isEditorFullscreen"
                      class="absolute top-2 right-2 z-10 p-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 hover:text-white rounded transition-colors"
                      :title="isEditorFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
                    >
                      <svg v-if="!isEditorFullscreen" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <CodeEditor
                      v-model="code"
                      :language="language"
                      :placeholder="placeholderCode"
                      :disabled="loading.create"
                    />
                    <!-- Character Count -->
                    <div class="px-4 py-2 border-t border-gray-500/10 flex justify-between items-center text-xs">
                      <span :class="[
                        'font-medium',
                        codeBytes > MAX_CODE_SIZE ? 'text-red-400' : codeBytes > MAX_CODE_SIZE * 0.9 ? 'text-amber-400' : 'text-gray-500'
                      ]">
                        {{ formatBytes(codeBytes) }} / {{ formatBytes(MAX_CODE_SIZE) }}
                      </span>
                      <span :class="[
                        'text-xs',
                        codeBytes > MAX_CODE_SIZE ? 'text-red-400' : codeBytes > MAX_CODE_SIZE * 0.9 ? 'text-amber-400' : 'text-gray-500'
                      ]">
                        {{ codePercentage }}% used
                      </span>
                    </div>
                  </div>

                  <!-- Error Display -->
                  <div v-if="error.create" class="mx-4 mt-4">
                    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-2 flex-1">
                          <svg class="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div class="flex-1">
                            <p class="text-red-400 text-sm font-medium">{{ error.create }}</p>
                            <div v-if="errorDetails.create" class="mt-2">
                              <button
                                @click="showErrorDetails = !showErrorDetails"
                                class="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
                              >
                                <svg class="w-3 h-3" :class="showErrorDetails ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                                {{ showErrorDetails ? 'Hide' : 'Show' }} details
                              </button>
                              <pre v-if="showErrorDetails" class="mt-2 p-3 bg-black/30 rounded text-xs text-red-300 overflow-x-auto">{{ errorDetails.create }}</pre>
                            </div>
                          </div>
                        </div>
                        <button
                          @click="retryCreateEndpoint"
                          class="shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Configuration and Create Button -->
                  <div class="flex justify-between items-end p-4 border-t border-gray-500/10">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <!-- Language Select -->
                      <div class="relative">
                        <label class="block text-xs font-semibold mb-2 text-gray-300">Language</label>
                        <select
                          v-model="language"
                          :disabled="loading.create"
                          class="block w-full appearance-none rounded-lg bg-gray-500/5 py-2.5 pl-4 pr-10 text-sm font-medium text-white border border-gray-500/10 hover:bg-gray-500/10 focus:outline-none focus:ring-2 focus:ring-gray-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-6">
                          <svg class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      <!-- TTL Display (fixed at 1 hour for public users) -->
                      <div class="relative">
                        <label class="block text-xs font-semibold mb-2 text-gray-300">Expires In</label>
                        <div class="block w-full rounded-lg bg-gray-500/5 py-2.5 px-4 text-sm font-medium text-gray-400 border border-gray-500/10">
                          1 hour
                        </div>
                        <!-- <p class="text-xs text-gray-500 mt-1">Sign in for more options</p> -->
                      </div>

                      <!-- Kind Select -->
                      <div class="relative">
                        <label class="block text-xs font-semibold mb-2 text-gray-300">
                          Mode
                          <!-- <span v-if="kind === 'webhook'" class="ml-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                            Webhook
                          </span>
                          <span v-else class="ml-2 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                            Standard
                          </span> -->
                        </label>
                        <select
                          v-model="kind"
                          :disabled="loading.create"
                          :class="[
                            'block w-full appearance-none rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-white border hover:bg-gray-500/10 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150',
                            kind === 'webhook' 
                              ? 'bg-gray-500/5 border-gray-500/10 focus:ring-blue-500/10' 
                              : 'bg-gray-500/5 border-gray-500/10 focus:ring-gray-500/10'
                          ]"
                        >
                          <option value="snippet">Standard</option>
                          <option value="webhook">Webhook</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-6">
                          <svg class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <!-- Create Button -->
                    <button
                      @click="createEndpoint"
                      :disabled="loading.create || (!code.trim() && !selectedFile)"
                      class="btn-primary w-auto h-10 text-sm py-2 font-medium flex items-center gap-2 min-w-[140px] justify-center"
                    >
                      <!-- Loading Spinner -->
                      <svg v-if="loading.create" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span v-if="loading.create">Creating...</span>
                      <span v-else>Create an API</span>
                    </button>
                  </div>
                </div>
              </div>
              <span
                class="main-section bottom-l absolute w-[1px] h-[1px] bottom-[-1px] left-[-1px]"
              ></span
              ><span
                class="main-section bottom-l absolute w-px h-px -bottom-px -right-px"
              ></span
              ><span
                class="main-section bottom-l absolute w-px h-px -top-px -right-px"
              ></span
              ><span
                class="main-section bottom-l absolute w-px h-px -top-px -left-px"
              ></span>
            </div>

            <!-- Success Modal -->
            <Teleport to="body">
              <Transition
                enter-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <div v-if="endpointUrl" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="closeModal">
                  <Transition
                    enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-200"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div v-if="endpointUrl" class="card bg-black! p-6 md:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-gray-500/30 relative">
              <!-- Close Button -->
              <button
                @click="closeModal"
                class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 class="text-2xl font-medium mb-8 text-white">
                Your API is live and ready to use
              </h2>

              <!-- Endpoint Info -->
              <div class="mb-6 p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">Language:</span>
                    <span class="text-white ml-2">{{ createdEndpoint?.language }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Mode:</span>
                    <span class="text-white ml-2">{{ createdEndpoint?.kind }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">TTL:</span>
                    <span class="text-white ml-2">{{ createdEndpoint?.ttlHours }}h</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Expires:</span>
                    <span class="text-white ml-2">{{ expiresAt }}</span>
                  </div>
                </div>
                <div v-if="createdEndpoint?.name" class="mt-3 pt-3 border-t border-gray-500/20">
                  <div class="text-sm">
                    <span class="text-gray-400">Name:</span>
                    <span class="text-white ml-2">{{ createdEndpoint.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Endpoint URL -->
              <div class="mb-6">
                <label class="block text-sm font-medium mb-2 text-gray-300">
                  Your Endpoint URL
                </label>
                <div class="flex gap-2 items-start">
                  <div 
                    @click="copyToClipboard(endpointUrl, 'main-url')"
                    class="code-block flex-1 break-all overflow-hidden text-blue-300 text-sm cursor-pointer hover:bg-blue-300/10 transition-colors rounded px-2 py-1 -mx-2 -my-1"
                    title="Click to copy"
                  >
                    {{ endpointUrl }}
                  </div>
                  <button
                    @click="copyToClipboard(endpointUrl, 'main-url-btn')"
                    :class="[
                      'px-2 py-2 shrink-0 transition-colors',
                      isCopied('main-url') || isCopied('main-url-btn')
                        ? 'bg-green-300/10 text-green-300'
                        : 'btn-secondary'
                    ]"
                    :title="isCopied('main-url') || isCopied('main-url-btn') ? 'Copied!' : 'Copy URL'"
                  >
                    <svg v-if="!isCopied('main-url') && !isCopied('main-url-btn')" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                
                <!-- Quick Actions -->
                <div class="flex gap-2 mt-3">
                  <button
                    @click="checkEndpointHealth"
                    :disabled="healthStatus === 'checking'"
                    class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    title="Check endpoint health"
                  >
                    <!-- Spinner for checking state -->
                    <svg v-if="healthStatus === 'checking'" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <!-- Check circle for healthy state -->
                    <svg v-else-if="healthStatus === 'healthy'" class="h-3 w-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                    </svg>
                    <!-- X circle for error state -->
                    <svg v-else-if="healthStatus === 'error'" class="h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                    <!-- Heart icon for default/ready state -->
                    <svg v-else class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    Health Check
                  </button>
                  <button
                    @click="copyCurlCommand"
                    class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    title="Copy curl command"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy curl
                  </button>
                  <!-- <button
                    @click="toggleQRCode"
                    class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    title="Show QR code"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                    </svg>
                    QR Code
                  </button> -->
                </div>
                
                <!-- QR Code Display -->
                <Transition
                  enter-active-class="transition-all duration-200"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-200"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <div v-if="showQRCode" class="mt-4 p-4 bg-white rounded-lg flex flex-col items-center">
                    <img :src="qrCodeUrl" alt="QR Code" class="w-48 h-48" />
                    <p class="text-xs text-gray-600 mt-2">Scan to access endpoint</p>
                  </div>
                </Transition>
              </div>

              <!-- Usage Examples -->
              <div class="mb-8 p-6 bg-gray-500/10 rounded-lg border border-gray-500/20">
                <h4 class="text-sm font-medium mb-4 text-white">How to call your API</h4>
                
                <!-- cURL Example -->
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-400">cURL</span>
                    <button
                      @click="copyToClipboard(curlExample)"
                      class="text-xs px-1.5 py-1.5 hover:bg-gray-500/15 text-white rounded transition-colors flex items-center gap-1.5"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <pre class="code-block text-xs overflow-x-auto" v-html="highlightedCurl"></pre>
                </div>

                <!-- JavaScript Fetch Example -->
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-400">JavaScript (fetch)</span>
                    <button
                      @click="copyToClipboard(fetchExample)"
                      class="text-xs px-1.5 py-1.5 hover:bg-gray-500/15 text-white rounded transition-colors flex items-center gap-1.5"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <pre class="code-block text-xs overflow-x-auto" v-html="highlightedFetch"></pre>
                </div>

                <!-- Python Requests Example -->
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-400">Python (requests)</span>
                    <button
                      @click="copyToClipboard(pythonExample)"
                      class="text-xs px-1.5 py-1.5 hover:bg-gray-500/15 text-white rounded transition-colors flex items-center gap-1.5"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <pre class="code-block text-xs overflow-x-auto" v-html="highlightedPython"></pre>
                </div>

                <!-- SDK Example -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-400">SDK (npm install @instantapihq/client)</span>
                    <button
                      @click="copyToClipboard(sdkExample)"
                      class="text-xs px-1.5 py-1.5 hover:bg-gray-500/15 text-white rounded transition-colors flex items-center gap-1.5"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <pre class="code-block text-xs overflow-x-auto" v-html="highlightedSdk"></pre>
                </div>
              </div>
                    </div>
                  </Transition>
                </div>
              </Transition>
            </Teleport>
          </div>
        
          <!-- Output Preview Panel (Right Side) -->
          <div class="hidden lg:block mt-[75px]">
            <div class="border bg-gray-500/5 border-l-0 border-gray-500/15 overflow-hidden sticky top-20">
              <!-- Preview Header -->
              <div class="p-4 border-b border-gray-500/10 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="selectedExampleIndex !== null ? 'bg-green-400 animate-pulse' : 'bg-gray-500'"></div>
                  <span class="text-sm font-medium text-white">Output Preview</span>
                </div>
                <span class="text-xs text-gray-500">{{ currentExampleOutput?.type || 'Select an example' }}</span>
              </div>
              
              <!-- Preview Content -->
              <div class="min-h-[380px] flex flex-col">
                <!-- No Example Selected -->
                <div v-if="selectedExampleIndex === null" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div class="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <p class="text-gray-400 text-sm mb-2">Select an example to see output</p>
                  <p class="text-gray-600 text-xs">Choose from AI agents, image generators, web scrapers & more</p>
                </div>
                
                <!-- Image Output (for DALL-E) -->
                <div v-else-if="currentExampleOutput?.type === 'image'" class="flex-1 flex flex-col">
                  <div class="flex-1 bg-gradient-to-br from-orange-300/20 via-pink-300/20 to-purple-300/20 p-6 flex items-center justify-center">
                    <img 
                      :src="currentExampleOutput.preview" 
                      :alt="currentExampleOutput.description"
                      class="max-w-full max-h-[280px] rounded-lg shadow-2xl object-cover"
                    />
                  </div>
                  <div class="p-4 border-t border-gray-500/10 bg-black/50">
                    <p class="text-white text-sm font-medium mb-1">{{ currentExampleOutput.description }}</p>
                    <p class="text-gray-500 text-xs font-mono">{{ currentExampleOutput.model }}</p>
                  </div>
                </div>
                
                <!-- Text/Chat Output (for OpenAI/Anthropic) -->
                <div v-else-if="currentExampleOutput?.type === 'chat'" class="flex-1 flex flex-col">
                  <div class="flex-1 p-4 space-y-4 overflow-y-auto">
                    <!-- User Message -->
                    <div class="flex gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-300/20 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-xs text-gray-500 mb-1">You</p>
                        <p class="text-sm text-gray-300">{{ currentExampleOutput.prompt }}</p>
                      </div>
                    </div>
                    <!-- AI Response -->
                    <div class="flex gap-3">
                      <div class="w-8 h-8 rounded-full bg-green-300/20 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-xs text-gray-500 mb-1">{{ currentExampleOutput.model }}</p>
                        <p class="text-sm text-gray-200 leading-relaxed">{{ currentExampleOutput.response }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="p-3 py-2 border-t border-gray-500/10 bg-black/50 flex items-center justify-between">
                    <span class="text-xs text-gray-500">{{ currentExampleOutput.tokens }}</span>
                    <span class="text-xs text-green-300">{{ currentExampleOutput.latency }}</span>
                  </div>
                </div>
                
                <!-- JSON Output (for Web Scraper, Hello, etc.) -->
                <div v-else-if="currentExampleOutput?.type === 'json'" class="flex-1 flex flex-col">
                  <div class="flex-1 p-4 overflow-auto">
                    <pre class="text-xs text-gray-300 font-mono whitespace-pre-wrap">{{ currentExampleOutput.data }}</pre>
                  </div>
                  <div class="p-3 border-t border-gray-500/10 bg-black/50 flex items-center justify-between">
                    <span class="text-xs text-gray-500">{{ currentExampleOutput.description }}</span>
                    <span class="text-xs text-green-300">{{ currentExampleOutput.latency }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer aria-labelledby="footer-heading" class="">
	
      <h2 id="footer-heading" class="sr-only">Footer</h2>
      <div class="mx-auto max-w-7xl px-6 lg:px-0">
        <div class="border-t border-transparent flex flex-col md:flex-row items-center justify-between py-6">
          <div class="flex items-center justify-center gap-3 relative">
            <p class="text-xs leading-6 font-medium text-gray-500 xl:text-center">
              &copy; 2025 Treadie, Inc.
            </p>
          </div>
          <div
            class="flex space-x-6 items-center md:mt-0 mt-4"
          >
            <a
              href="https://discord.gg/KqdBcqRk5E"
              target="_blank"
              class="text-sm font-semibold leading-6 hover:text-blue-300 text-gray-500"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" class="h-5 w-5" fill="currentColor">
                <path d="M16.238 4.515a14.842 14.842 0 0 0-3.664-1.136.055.055 0 0 0-.059.027 10.35 10.35 0 0 0-.456.938 13.702 13.702 0 0 0-4.115 0 9.479 9.479 0 0 0-.464-.938.058.058 0 0 0-.058-.027c-1.266.218-2.497.6-3.664 1.136a.052.052 0 0 0-.024.02C1.4 8.023.76 11.424 1.074 14.782a.062.062 0 0 0 .024.042 14.923 14.923 0 0 0 4.494 2.272.058.058 0 0 0 .064-.02c.346-.473.654-.972.92-1.496a.057.057 0 0 0-.032-.08 9.83 9.83 0 0 1-1.404-.669.058.058 0 0 1-.029-.046.058.058 0 0 1 .023-.05c.094-.07.189-.144.279-.218a.056.056 0 0 1 .058-.008c2.946 1.345 6.135 1.345 9.046 0a.056.056 0 0 1 .059.007c.09.074.184.149.28.22a.058.058 0 0 1 .023.049.059.059 0 0 1-.028.046 9.224 9.224 0 0 1-1.405.669.058.058 0 0 0-.033.033.056.056 0 0 0 .002.047c.27.523.58 1.022.92 1.495a.056.056 0 0 0 .062.021 14.878 14.878 0 0 0 4.502-2.272.055.055 0 0 0 .016-.018.056.056 0 0 0 .008-.023c.375-3.883-.63-7.256-2.662-10.246a.046.046 0 0 0-.023-.021Zm-9.223 8.221c-.887 0-1.618-.814-1.618-1.814s.717-1.814 1.618-1.814c.908 0 1.632.821 1.618 1.814 0 1-.717 1.814-1.618 1.814Zm5.981 0c-.887 0-1.618-.814-1.618-1.814s.717-1.814 1.618-1.814c.908 0 1.632.821 1.618 1.814 0 1-.71 1.814-1.618 1.814Z"></path>
              </svg>
            </a>
            <a
              href="https://github.com/treadiehq/instantapi"
              target="_blank"
              class="text-sm font-semibold leading-6 hover:text-blue-300 text-gray-500"
            >
              <svg
                aria-label="github"
                viewBox="0 0 14 14"
                class="h-4 w-4"
                fill="currentColor"
              >
                <path
                  d="M7 .175c-3.872 0-7 3.128-7 7 0 3.084 2.013 5.71 4.79 6.65.35.066.482-.153.482-.328v-1.181c-1.947.415-2.363-.941-2.363-.941-.328-.81-.787-1.028-.787-1.028-.634-.438.044-.416.044-.416.7.044 1.071.722 1.071.722.635 1.072 1.641.766 2.035.59.066-.459.24-.765.437-.94-1.553-.175-3.193-.787-3.193-3.456 0-.766.262-1.378.721-1.881-.065-.175-.306-.897.066-1.86 0 0 .59-.197 1.925.722a6.754 6.754 0 0 1 1.75-.24c.59 0 1.203.087 1.75.24 1.335-.897 1.925-.722 1.925-.722.372.963.131 1.685.066 1.86.46.48.722 1.115.722 1.88 0 2.691-1.641 3.282-3.194 3.457.24.219.481.634.481 1.29v1.926c0 .197.131.415.481.328C11.988 12.884 14 10.259 14 7.175c0-3.872-3.128-7-7-7z"
                  fill="currentColor"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </a>
            <a
              href="https://twitter.com/treadieinc"
              target="_blank"
              class="hover:text-blue-300 text-gray-500"
            >
              <span class="sr-only">X formerly known as Twitter</span>
              <svg aria-label="X formerly known as Twitter" fill="currentColor" class="h-4 w-4" viewBox="0 0 22 20"><path d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z" class="astro-3SDC4Q5U"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
    
    <!-- Toast Notifications -->
    <Toast ref="toastComponent" />
    
    <!-- Fullscreen Editor Overlay -->
    <Teleport to="body">
      <div
        v-if="isEditorFullscreen"
        class="fixed inset-0 z-50 bg-black flex flex-col"
      >
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-500/20">
          <div class="flex items-center space-x-4">
            <h3 class="text-sm font-medium text-white">Code Editor</h3>
            <span class="text-xs text-gray-500">{{ language }}</span>
          </div>
          <button
            @click="isEditorFullscreen = false"
            class="p-2 text-gray-400 hover:text-white transition-colors"
            title="Exit Fullscreen (Esc)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-hidden">
          <CodeEditor
            v-model="code"
            :language="language"
            :placeholder="placeholderCode"
            :disabled="loading.create"
          />
        </div>
        <div class="px-6 py-3 border-t border-gray-500/20 flex justify-between items-center">
          <div class="text-xs space-x-4">
            <span :class="[
              'font-medium',
              codeBytes > MAX_CODE_SIZE ? 'text-red-400' : codeBytes > MAX_CODE_SIZE * 0.9 ? 'text-amber-400' : 'text-gray-400'
            ]">
              {{ formatBytes(codeBytes) }} / {{ formatBytes(MAX_CODE_SIZE) }}
            </span>
            <span :class="[
              codeBytes > MAX_CODE_SIZE ? 'text-red-400' : codeBytes > MAX_CODE_SIZE * 0.9 ? 'text-amber-400' : 'text-gray-500'
            ]">
              {{ codePercentage }}% used
            </span>
          </div>
          <button
            @click="isEditorFullscreen = false"
            class="btn-secondary py-2 px-4 text-xs"
          >
            Done Editing
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="deleteConfirmation.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="deleteConfirmation.show = false">
        <div class="bg-black border border-gray-500/30 rounded-lg p-6 max-w-md w-full">
          <div class="flex items-start gap-4 mb-4">
            <div class="flex-shrink-0 w-10 h-10 bg-red-400/10 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white mb-2">Delete API Endpoint?</h3>
              <p class="text-sm text-gray-400">
                This endpoint will be permanently deleted. This action cannot be undone.
              </p>
              <div v-if="deleteConfirmation.endpointData" class="mt-3 p-2 bg-gray-500/5 border border-gray-500/10 rounded text-xs">
                <p class="text-gray-500">ID: <span class="text-blue-300 font-mono">{{ deleteConfirmation.endpointData.id.substring(0, 12) }}...</span></p>
                <p class="text-gray-500">Language: <span class="text-white">{{ deleteConfirmation.endpointData.language }}</span></p>
                <p class="text-gray-500" v-if="deleteConfirmation.endpointData.name">Name: <span class="text-white">{{ deleteConfirmation.endpointData.name }}</span></p>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="deleteConfirmation.show = false"
              class="flex-1 px-4 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="executeDeleteEndpoint"
              :disabled="deletingEndpointId !== null"
              class="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ deletingEndpointId ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Redirect authenticated users to dashboard
definePageMeta({
  middleware: ['guest'],
});

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Set page title
useHead({
  title: 'Instant API - Turn code into APIs instantly',
});

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase
const router = useRouter()

// Toast notification system
const toastComponent = ref<any>(null)
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
  if (toastComponent.value) {
    toastComponent.value.show(message, type, duration)
  }
}

// Form state
const mode = ref<'snippet' | 'file' | 'framework' | 'function' | 'stream'>('snippet')
const language = ref<'javascript' | 'python'>('javascript')
const code = ref('')
const ttlHours = ref(1)
const kind = ref<'snippet' | 'webhook'>('snippet')
const endpointName = ref('')
const endpointDescription = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Fullscreen editor state
const isEditorFullscreen = ref(false)

// Drag & drop state
const isDragging = ref(false)
const dragCounter = ref(0)

// Auto-save draft state
const DRAFT_KEY = 'instantapi_draft'
const lastSaved = ref<Date | null>(null)

// Code size constants and tracking
const MAX_CODE_SIZE = 3 * 1024 * 1024 // 3MB in bytes

// Computed: Code size in bytes
const codeBytes = computed(() => new Blob([code.value]).size)

// Computed: Percentage used
const codePercentage = computed(() => Math.min(100, Math.round((codeBytes.value / MAX_CODE_SIZE) * 100)))

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// Dashboard state
const endpoints = ref<any[]>([])
const tunnels = ref<any[]>([])
const loading = ref({ create: false, test: false, health: false, dashboard: false })
const deletingEndpointId = ref<string | null>(null)
const deleteConfirmation = ref({
  show: false,
  endpointId: null as string | null,
  endpointData: null as any,
})

// Copy feedback state
const copiedItems = ref<Set<string>>(new Set())

// Pagination state
const itemsPerPage = 10
const endpointsPage = ref(1)
const tunnelsPage = ref(1)

// Computed: Paginated endpoints
const paginatedEndpoints = computed(() => {
  const start = 0
  const end = endpointsPage.value * itemsPerPage
  return endpoints.value.slice(start, end)
})

// Computed: Paginated tunnels
const paginatedTunnels = computed(() => {
  const start = 0
  const end = tunnelsPage.value * itemsPerPage
  return tunnels.value.slice(start, end)
})

// Computed: Has more items
const hasMoreEndpoints = computed(() => endpoints.value.length > endpointsPage.value * itemsPerPage)
const hasMoreTunnels = computed(() => tunnels.value.length > tunnelsPage.value * itemsPerPage)

// Watch for language changes and clear code if it has content
watch(language, (newLang, oldLang) => {
  if (newLang !== oldLang && code.value.trim()) {
    // Clear code when switching languages to avoid confusion
    code.value = ''
  }
})

// Auto-save draft functionality
let draftSaveTimeout: NodeJS.Timeout | null = null
watch([code, language, mode, kind, ttlHours, endpointName, endpointDescription], () => {
  if (draftSaveTimeout) {
    clearTimeout(draftSaveTimeout)
  }
  
  draftSaveTimeout = setTimeout(() => {
    if (code.value.trim() || endpointName.value || endpointDescription.value) {
      const draft = {
        code: code.value,
        language: language.value,
        mode: mode.value,
        kind: kind.value,
        ttlHours: ttlHours.value,
        endpointName: endpointName.value,
        endpointDescription: endpointDescription.value,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      lastSaved.value = new Date()
    }
  }, 1000)
})

// Fetch user's endpoints
async function fetchEndpoints() {
  // Not used on public page - authenticated users are redirected to /dashboard
  return;
  
  loading.value.dashboard = true;
  try {
    const { token } = useAuth();
    const response = await fetch(`${API_BASE}/api/endpoints`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      endpoints.value = data;
    }
  } catch (error) {
    // Failed to fetch endpoints
  } finally {
    loading.value.dashboard = false;
  }
}

// Fetch user's tunnels
async function fetchTunnels() {
  // Not used on public page - authenticated users are redirected to /dashboard
  return;
  
  try {
    const { token } = useAuth();
    const response = await fetch(`${API_BASE}/api/tunnels`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });
    if (response.ok) {
      tunnels.value = await response.json();
    }
  } catch (error) {
    // Failed to fetch tunnels
  }
}

// Fetch all dashboard data
async function fetchDashboard() {
  // Not used on public page - authenticated users are redirected to /dashboard
  return;
}

// Show delete confirmation modal
function confirmDeleteEndpoint(endpoint: any) {
  deleteConfirmation.value = {
    show: true,
    endpointId: endpoint.id,
    endpointData: endpoint,
  }
}

// Execute delete after confirmation
async function executeDeleteEndpoint() {
  const id = deleteConfirmation.value.endpointId
  if (!id) return

  deletingEndpointId.value = id;
  try {
    const { token } = useAuth();
    const response = await fetch(`${API_BASE}/api/endpoints/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (response.ok) {
      // Remove from local state
      endpoints.value = endpoints.value.filter(e => e.id !== id);
      showToast('Endpoint deleted successfully', 'success');
      deleteConfirmation.value.show = false
    } else {
      const error = await response.json();
      showToast(error.message || 'Failed to delete endpoint', 'error');
    }
  } catch (error: any) {
    showToast(error.message || 'Failed to delete endpoint', 'error');
  } finally {
    deletingEndpointId.value = null;
  }
}

// Format date helper
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// Load draft on mount
onMounted(() => {
  // Clear any old drafts and always start fresh with a good example
  localStorage.removeItem(DRAFT_KEY)
  
  // Load default example (AI Agent OpenAI)
  if (examples.value.length > 1) {
    const defaultIndex = 1 // AI Agent (OpenAI)
    selectedExampleIndex.value = defaultIndex
    const example = examples.value[defaultIndex]
    if (example) {
      code.value = example.code
      requestBody.value = example.testInput
    }
  }
  
  // No dashboard data to fetch on public page - authenticated users redirected to /dashboard
  
  // Handle Escape key for fullscreen editor
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isEditorFullscreen.value) {
      isEditorFullscreen.value = false
    }
  }
  window.addEventListener('keydown', handleKeydown)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})

// Clear draft when endpoint is created
function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
  lastSaved.value = null
}

// Response state
const endpointUrl = ref<string | null>(null)
const endpointId = ref<string | null>(null)
const expiresAt = ref<string | null>(null)
const createdEndpoint = ref<any>(null)

// Usage example code snippets
const curlExample = computed(() => {
  if (!endpointUrl.value) return ''
  return `curl -X POST ${endpointUrl.value} \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.value || '{"key": "value"}'}'`
})

const fetchExample = computed(() => {
  if (!endpointUrl.value) return ''
  const body = requestBody.value || '{"key": "value"}'
  return `fetch('${endpointUrl.value}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '${body}'
})
  .then(res => res.json())
  .then(data => console.log(data));`
})

const sdkExample = computed(() => {
  if (!endpointId.value) return ''
  const body = requestBody.value ? JSON.parse(requestBody.value) : { key: 'value' }
  const bodyStr = JSON.stringify(body, null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')
  return `import InstantAPI from '@instantapihq/client';

const api = new InstantAPI();
const { result } = await api.run('${endpointId.value}', ${bodyStr});
console.log(result);`
})

const pythonExample = computed(() => {
  if (!endpointUrl.value) return ''
  const body = requestBody.value || '{"key": "value"}'
  return `import requests

response = requests.post(
    '${endpointUrl.value}',
    json=${body}
)
print(response.json())`
})

// Syntax-highlighted versions
const highlightedCurl = computed(() => {
  if (!curlExample.value) return ''
  return curlExample.value
    .replace(/(curl|-X|-H|-d)/g, '<span class="text-purple-400">$1</span>')
    .replace(/(POST)/g, '<span class="text-green-400">$1</span>')
    .replace(/(http:\/\/[^\s\\]+)/g, '<span class="text-blue-300">$1</span>')
    .replace(/("Content-Type: application\/json")/g, '<span class="text-yellow-300">$1</span>')
    .replace(/('\{[^']+\}')/g, '<span class="text-orange-300">$1</span>')
    .replace(/(\\)/g, '<span class="text-gray-500">$1</span>')
})

const highlightedFetch = computed(() => {
  if (!fetchExample.value) return ''
  return fetchExample.value
    .replace(/(fetch|method|headers|body|then|const|res|data|console|log)/g, '<span class="text-purple-400">$1</span>')
    .replace(/(POST)/g, '<span class="text-green-400">$1</span>')
    .replace(/(http:\/\/[^\s']+)/g, '<span class="text-blue-300">$1</span>')
    .replace(/('Content-Type'|'application\/json')/g, '<span class="text-yellow-300">$1</span>')
    .replace(/(json\(\))/g, '<span class="text-cyan-400">$1</span>')
    .replace(/(\{|\}|\(|\)|\[|\])/g, '<span class="text-gray-400">$1</span>')
    .replace(/(=>)/g, '<span class="text-pink-400">$1</span>')
})

const highlightedPython = computed(() => {
  if (!pythonExample.value) return ''
  return pythonExample.value
    .replace(/(import|json|print)/g, '<span class="text-purple-400">$1</span>')
    .replace(/(requests)/g, '<span class="text-cyan-400">$1</span>')
    .replace(/(post|json\(\))/g, '<span class="text-green-400">$1</span>')
    .replace(/(http:\/\/[^\s']+)/g, '<span class="text-blue-300">$1</span>')
    .replace(/(response)/g, '<span class="text-orange-300">$1</span>')
    .replace(/(\{[^}]+\})/g, '<span class="text-yellow-300">$1</span>')
})

const highlightedSdk = computed(() => {
  if (!sdkExample.value) return ''
  return sdkExample.value
    .replace(/(import|from|const|await|new)/g, '<span class="text-purple-400">$1</span>')
    .replace(/(InstantAPI)/g, '<span class="text-cyan-400">$1</span>')
    .replace(/(api|result)/g, '<span class="text-orange-300">$1</span>')
    .replace(/('[@\w\/-]+')/g, '<span class="text-green-400">$1</span>')
    .replace(/(console|log|run)/g, '<span class="text-blue-300">$1</span>')
})

// Test state
const requestBody = ref('{\n  "name": "World",\n  "greeting": "Hello"\n}')
const responseBody = ref<any>(null)
const logs = ref<string[]>([])
const executionTime = ref<number | null>(null)
const executionError = ref<any>(null)
const jsonValidationError = ref<string | null>(null)

// Validate JSON in real-time
watch(requestBody, (newValue) => {
  if (!newValue.trim()) {
    jsonValidationError.value = null
    return
  }
  
  try {
    JSON.parse(newValue)
    jsonValidationError.value = null
  } catch (e: any) {
    // Extract line number and message from JSON parse error
    const match = e.message.match(/position (\d+)/)
    if (match) {
      const position = parseInt(match[1])
      const lines = newValue.substring(0, position).split('\n')
      const lineNumber = lines.length
      jsonValidationError.value = `Invalid JSON at line ${lineNumber}: ${e.message}`
    } else {
      jsonValidationError.value = `Invalid JSON: ${e.message}`
    }
  }
}, { immediate: true })

// Error states
const error = ref({
  create: '',
  test: '',
})
const errorDetails = ref({
  create: '',
  test: '',
})
const showErrorDetails = ref(false)
const showTestErrorDetails = ref(false)

// Placeholder code examples
const placeholderCode = computed(() => {
  if (language.value === 'javascript') {
    if (kind.value === 'webhook') {
      return `// Webhook mode: handler receives (input, headers)
function handler(input, headers) {
  console.log('Received webhook:', input);
  console.log('Headers:', headers);
  return { 
    received: input,
    from: headers['user-agent']
  };
}`
    }
    return `// Option 1: Use a handler function
function handler(input) {
  return { message: "Hello " + input.name };
}

// Option 2: Just write code and assign to 'result'
// const result = { message: "Hello World" };`
  } else {
    if (kind.value === 'webhook') {
      return `# Webhook mode: handler receives (input, headers)
def handler(input, headers):
    print('Received webhook:', input)
    print('Headers:', headers)
    return {
        "received": input,
        "from": headers.get('user-agent', 'unknown')
    }`
    }
    return `# Option 1: Use a handler function
def handler(input):
    return {"message": f"Hello {input.get('name')}"}

# Option 2: Just assign to 'result'
# result = {"message": "Hello World"}`
  }
})

// Example code snippets
const examples = computed(() => {
  if (language.value === 'javascript') {
    return [
      {
        name: 'Hello',
        code: `// No handler needed - just assign to 'result'
const name = input.name || "World";
const result = {
  message: \`Hello, \${name}!\`,
  timestamp: new Date().toISOString()
};`,
        testInput: '{\n  "name": "Dante"\n}'
      },
      {
        name: 'AI Agent (OpenAI)',
        code: `// AI Agent using OpenAI API
async function handler(input) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${input.apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: input.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: input.prompt }],
      max_tokens: input.maxTokens || 500
    })
  });
  
  const data = await response.json();
  return {
    response: data.choices?.[0]?.message?.content,
    model: input.model || 'gpt-4o-mini',
    usage: data.usage
  };
}`,
        testInput: '{\n  "apiKey": "sk-your-openai-key",\n  "prompt": "What is the capital of France?",\n  "model": "gpt-4o-mini"\n}'
      },
      {
        name: 'AI Agent (Anthropic)',
        code: `// AI Agent using Anthropic Claude API
async function handler(input) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': input.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: input.model || 'claude-3-5-sonnet-20241022',
      max_tokens: input.maxTokens || 1024,
      messages: [{ role: 'user', content: input.prompt }]
    })
  });
  
  const data = await response.json();
  return {
    response: data.content?.[0]?.text,
    model: data.model,
    usage: data.usage
  };
}`,
        testInput: '{\n  "apiKey": "sk-ant-your-anthropic-key",\n  "prompt": "Explain quantum computing in simple terms",\n  "model": "claude-3-5-sonnet-20241022"\n}'
      },
      {
        name: 'Image Generator (DALL-E)',
        code: `// Generate images using OpenAI DALL-E
async function handler(input) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${input.apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: input.prompt,
      n: 1,
      size: input.size || '1024x1024',
      quality: input.quality || 'standard'
    })
  });
  
  const data = await response.json();
  return {
    imageUrl: data.data?.[0]?.url,
    revisedPrompt: data.data?.[0]?.revised_prompt
  };
}`,
        testInput: '{\n  "apiKey": "sk-your-openai-key",\n  "prompt": "A futuristic city with flying cars at sunset",\n  "size": "1024x1024"\n}'
      },
      {
        name: 'Web Scraper',
        code: `// Simple web scraper - fetches and extracts data from URLs
async function handler(input) {
  const url = input.url;
  if (!url) throw new Error('URL is required');
  
  const response = await fetch(url);
  const html = await response.text();
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1].trim() : null;
  
  // Extract all links
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi);
  const links = [...linkMatches].map(m => m[1]).slice(0, 20);
  
  return {
    url,
    title,
    description,
    linkCount: links.length,
    links,
    contentLength: html.length
  };
}`,
        testInput: '{\n  "url": "https://example.com"\n}'
      },
      {
        name: 'Fetch API',
        code: `// Outbound HTTP example using fetch
async function handler(input) {
  const url = input.url || 'https://api.github.com/zen';
  
  const response = await fetch(url);
  const data = await response.text();
  
  return {
    url,
    data,
    timestamp: new Date().toISOString()
  };
}`,
        testInput: '{\n  "url": "https://api.github.com/zen"\n}'
      },
      {
        name: 'Webhook',
        code: `// Webhook handler - receives input and headers
function handler(input, headers) {
  console.log('Webhook received');
  console.log('User-Agent:', headers['user-agent']);
  
  return {
    event: input.event || 'unknown',
    data: input.data,
    source: headers['user-agent'],
    timestamp: new Date().toISOString()
  };
}`,
        testInput: '{\n  "event": "payment.success",\n  "data": {"amount": 100}\n}'
      }
    ]
  } else {
    return [
      {
        name: 'Hello',
        code: `# No handler needed - just assign to 'result'
name = input.get("name", "World")
result = {
    "message": f"Hello, {name}!",
    "language": "python"
}`,
        testInput: '{\n  "name": "Dante"\n}'
      },
      {
        name: 'AI Agent (OpenAI)',
        code: `# AI Agent using OpenAI SDK
from openai import OpenAI

def handler(input):
    client = OpenAI(api_key=input['apiKey'])
    
    response = client.chat.completions.create(
        model=input.get('model', 'gpt-4o-mini'),
        messages=[{"role": "user", "content": input['prompt']}],
        max_tokens=input.get('maxTokens', 500)
    )
    
    return {
        "response": response.choices[0].message.content,
        "model": response.model,
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens
        }
    }`,
        testInput: '{\n  "apiKey": "sk-your-openai-key",\n  "prompt": "What is the capital of France?",\n  "model": "gpt-4o-mini"\n}'
      },
      {
        name: 'AI Agent (Anthropic)',
        code: `# AI Agent using Anthropic Claude SDK
from anthropic import Anthropic

def handler(input):
    client = Anthropic(api_key=input['apiKey'])
    
    message = client.messages.create(
        model=input.get('model', 'claude-3-5-sonnet-20241022'),
        max_tokens=input.get('maxTokens', 1024),
        messages=[{"role": "user", "content": input['prompt']}]
    )
    
    return {
        "response": message.content[0].text,
        "model": message.model,
        "usage": {
            "input_tokens": message.usage.input_tokens,
            "output_tokens": message.usage.output_tokens
        }
    }`,
        testInput: '{\n  "apiKey": "sk-ant-your-anthropic-key",\n  "prompt": "Explain quantum computing in simple terms",\n  "model": "claude-3-5-sonnet-20241022"\n}'
      },
      {
        name: 'Image Generator (DALL-E)',
        code: `# Generate images using OpenAI DALL-E
from openai import OpenAI

def handler(input):
    client = OpenAI(api_key=input['apiKey'])
    
    response = client.images.generate(
        model="dall-e-3",
        prompt=input['prompt'],
        size=input.get('size', '1024x1024'),
        quality=input.get('quality', 'standard'),
        n=1
    )
    
    return {
        "imageUrl": response.data[0].url,
        "revisedPrompt": response.data[0].revised_prompt
    }`,
        testInput: '{\n  "apiKey": "sk-your-openai-key",\n  "prompt": "A futuristic city with flying cars at sunset",\n  "size": "1024x1024"\n}'
      },
      {
        name: 'Web Scraper',
        code: `# Simple web scraper using requests and BeautifulSoup
import requests
from bs4 import BeautifulSoup

def handler(input):
    url = input.get('url')
    if not url:
        raise ValueError('URL is required')
    
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; InstantAPI/1.0)'
    })
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract title
    title = soup.title.string if soup.title else None
    
    # Extract meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    description = meta_desc['content'] if meta_desc else None
    
    # Extract all links
    links = [a.get('href') for a in soup.find_all('a', href=True)][:20]
    
    return {
        "url": url,
        "title": title,
        "description": description,
        "linkCount": len(links),
        "links": links,
        "status": response.status_code
    }`,
        testInput: '{\n  "url": "https://example.com"\n}'
      },
      {
        name: 'HTTP Request',
        code: `# Outbound HTTP example using requests
import requests

def handler(input):
    url = input.get('url', 'https://api.github.com/zen')
    
    response = requests.get(url)
    
    return {
        "url": url,
        "data": response.text,
        "status": response.status_code
    }`,
        testInput: '{\n  "url": "https://api.github.com/zen"\n}'
      },
      {
        name: 'Webhook',
        code: `# Webhook handler - receives input and headers
def handler(input, headers):
    print('Webhook received')
    print('User-Agent:', headers.get('user-agent'))
    
    return {
        "event": input.get('event', 'unknown'),
        "data": input.get('data'),
        "source": headers.get('user-agent'),
    }`,
        testInput: '{\n  "event": "payment.success",\n  "data": {"amount": 100}\n}'
      }
    ]
  }
})

// Switch to file mode and clear code
function switchToFileMode() {
  mode.value = 'file'
  code.value = ''
}

// Switch to function mode
function switchToFunctionMode() {
  mode.value = 'function'
  code.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Switch to stream mode
function switchToStreamMode() {
  mode.value = 'stream'
  code.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Copy command helpers
async function copyInstallCommand() {
  const cmd = 'npm install @instantapihq/sdk'
  await copyToClipboard(cmd)
}

async function copyExposeCommand() {
  const cmd = 'npx @instantapihq/cli expose hello'
  await copyToClipboard(cmd)
}

async function copyStreamCommand() {
  const cmd = 'npx @instantapihq/cli expose http://localhost:3000/api/stream'
  await copyToClipboard(cmd)
}

// Load example code
const selectedExampleIndex = ref<number | null>(null)
const selectedExampleValue = computed({
  get: () => selectedExampleIndex.value !== null ? String(selectedExampleIndex.value) : '',
  set: (val: string) => {
    selectedExampleIndex.value = val ? parseInt(val) : null
  }
})

// Example output previews
const exampleOutputs = computed(() => {
  const jsOutputs = [
    // Hello
    {
      type: 'json',
      description: 'Simple greeting response',
      latency: '23ms',
      data: JSON.stringify({
        result: {
          message: "Hello, Dante!",
          timestamp: "2025-01-15T10:30:00.000Z"
        },
        durationMs: 23
      }, null, 2)
    },
    // AI Agent (OpenAI)
    {
      type: 'chat',
      model: 'gpt-4o-mini',
      prompt: 'What is the capital of France?',
      response: 'The capital of France is Paris. Paris is not only the political capital but also the cultural, economic, and historical heart of France. It\'s home to iconic landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.',
      tokens: '67 tokens',
      latency: '892ms'
    },
    // AI Agent (Anthropic)
    {
      type: 'chat',
      model: 'claude-3-5-sonnet',
      prompt: 'Explain quantum computing in simple terms',
      response: 'Imagine a regular computer as a person who can only read one book at a time. A quantum computer is like someone who can read all the books in a library simultaneously! It uses "qubits" instead of regular bits, which can be both 0 and 1 at the same time (called superposition). This allows quantum computers to solve certain complex problems much faster than traditional computers.',
      tokens: '89 tokens',
      latency: '1,247ms'
    },
    // Image Generator (DALL-E)
    {
      type: 'image',
      model: 'dall-e-3',
      description: 'A futuristic city with flying cars at sunset',
      preview: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format'
    },
    // Web Scraper
    {
      type: 'json',
      description: 'Extracted page data',
      latency: '156ms',
      data: JSON.stringify({
        result: {
          url: "https://example.com",
          title: "Example Domain",
          description: "This domain is for use in illustrative examples.",
          linkCount: 1,
          links: ["https://www.iana.org/domains/example"],
          contentLength: 1256
        },
        durationMs: 156
      }, null, 2)
    },
    // Fetch API
    {
      type: 'json',
      description: 'GitHub Zen quote',
      latency: '89ms',
      data: JSON.stringify({
        result: {
          url: "https://api.github.com/zen",
          data: "Responsive is better than fast.",
          timestamp: "2025-01-15T10:30:00.000Z"
        },
        durationMs: 89
      }, null, 2)
    },
    // Webhook
    {
      type: 'json',
      description: 'Webhook processed',
      latency: '12ms',
      data: JSON.stringify({
        result: {
          received: true,
          event: "user.created",
          processedAt: "2025-01-15T10:30:00.000Z",
          userAgent: "GitHub-Hookshot/abc123"
        },
        durationMs: 12
      }, null, 2)
    }
  ]
  
  const pyOutputs = [
    // Hello
    {
      type: 'json',
      description: 'Simple greeting response',
      latency: '45ms',
      data: JSON.stringify({
        result: {
          message: "Hello, Dante!",
          timestamp: "2025-01-15T10:30:00.000Z"
        },
        durationMs: 45
      }, null, 2)
    },
    // AI Agent (OpenAI)
    {
      type: 'chat',
      model: 'gpt-4o-mini',
      prompt: 'What is the capital of France?',
      response: 'The capital of France is Paris. Paris is not only the political capital but also the cultural, economic, and historical heart of France. It\'s home to iconic landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.',
      tokens: '67 tokens',
      latency: '934ms'
    },
    // AI Agent (Anthropic)
    {
      type: 'chat',
      model: 'claude-3-5-sonnet',
      prompt: 'Explain quantum computing in simple terms',
      response: 'Imagine a regular computer as a person who can only read one book at a time. A quantum computer is like someone who can read all the books in a library simultaneously! It uses "qubits" instead of regular bits, which can be both 0 and 1 at the same time (called superposition). This allows quantum computers to solve certain complex problems much faster than traditional computers.',
      tokens: '89 tokens',
      latency: '1,312ms'
    },
    // Image Generator
    {
      type: 'image',
      model: 'dall-e-3',
      description: 'A futuristic city with flying cars at sunset',
      preview: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop&auto=format'
    },
    // Web Scraper
    {
      type: 'json',
      description: 'Extracted page data with BeautifulSoup',
      latency: '203ms',
      data: JSON.stringify({
        result: {
          url: "https://example.com",
          title: "Example Domain",
          description: "This domain is for use in illustrative examples.",
          headings: ["Example Domain"],
          links: ["https://www.iana.org/domains/example"]
        },
        durationMs: 203
      }, null, 2)
    },
    // Fetch API
    {
      type: 'json',
      description: 'GitHub Zen quote',
      latency: '112ms',
      data: JSON.stringify({
        result: {
          url: "https://api.github.com/zen",
          data: "Mind your words, they are important.",
          timestamp: "2025-01-15T10:30:00.000Z"
        },
        durationMs: 112
      }, null, 2)
    },
    // Webhook
    {
      type: 'json',
      description: 'Webhook processed',
      latency: '18ms',
      data: JSON.stringify({
        result: {
          received: true,
          event: "user.created",
          processedAt: "2025-01-15T10:30:00.000Z"
        },
        durationMs: 18
      }, null, 2)
    }
  ]
  
  return language.value === 'javascript' ? jsOutputs : pyOutputs
})

const currentExampleOutput = computed(() => {
  if (selectedExampleIndex.value === null) return null
  return exampleOutputs.value[selectedExampleIndex.value] || null
})

function loadExample(idx: string) {
  if (!idx) {
    selectedExampleIndex.value = null
    return
  }
  const index = parseInt(idx)
  const example = examples.value[index]
  if (example) {
    code.value = example.code
    requestBody.value = example.testInput
    selectedExampleIndex.value = index
  }
}

// Handle file selection
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Validate file size (3MB limit)
    const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
    if (file.size > MAX_FILE_SIZE) {
      error.value.create = `File too large (${formatFileSize(file.size)}). Maximum size is 3MB.`
      selectedFile.value = null
      // Don't clear input - let user see what file they selected
      return
    }
    
    // Validate file extension
    const allowedExtensions = ['.js', '.ts', '.py']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      error.value.create = 'Invalid file type. Only .js, .ts, or .py files are supported.'
      selectedFile.value = null
      // Don't clear input - let user see what file they selected
      return
    }
    
    // Auto-detect language from extension
    if (fileName.endsWith('.py')) {
      language.value = 'python'
    } else if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
      language.value = 'javascript'
    }
    
    // File is valid
    selectedFile.value = file
    error.value.create = ''
    showToast(`File selected: ${file.name}`, 'info', 2000)
  }
}

// Handle drag events
function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  dragCounter.value = 0
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    
    // Create a synthetic event to reuse handleFileSelect logic
    const input = document.createElement('input')
    input.type = 'file'
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    input.files = dataTransfer.files
    
    handleFileSelect({ target: input } as any)
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Create API endpoint
async function createEndpoint() {
  loading.value.create = true
  error.value.create = ''

  try {
    const { token } = useAuth();
    let response: Response

    if (mode.value === 'snippet') {
      // Snippet mode: POST JSON
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`;
      }

      response = await fetch(`${API_BASE}/api/endpoints`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        language: language.value,
        code: code.value,
          name: endpointName.value || undefined,
          description: endpointDescription.value || undefined,
          ttlHours: ttlHours.value,
          kind: kind.value,
      }),
    })
    } else {
      // File upload mode: POST multipart/form-data
      if (!selectedFile.value) {
        error.value.create = 'Please select a file'
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('language', language.value)
      if (endpointName.value) formData.append('name', endpointName.value)
      if (endpointDescription.value) formData.append('description', endpointDescription.value)
      formData.append('ttlHours', ttlHours.value.toString())
      formData.append('kind', kind.value)

      response = await fetch(`${API_BASE}/api/endpoints/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
        body: formData,
      })
    }

    const data = await response.json()

    if (data.error) {
      error.value.create = data.error
      return
    }

    endpointId.value = data.id
    endpointUrl.value = data.url
    expiresAt.value = new Date(data.expiresAt).toLocaleString()
    createdEndpoint.value = data
    
    // Reset test state
    responseBody.value = null
    logs.value = []
    executionTime.value = null
    executionError.value = null
    
    // Clear draft
    clearDraft()
    
    // Show success toast
    showToast('🎉 API endpoint created successfully!', 'success', 3000)
    
    // No dashboard refresh needed on public page
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to create endpoint'
    error.value.create = errorMessage
    errorDetails.value.create = err.stack || JSON.stringify(err, null, 2)
    showToast(errorMessage, 'error', 5000)
  } finally {
    loading.value.create = false
  }
}

// Retry create endpoint
function retryCreateEndpoint() {
  error.value.create = ''
  errorDetails.value.create = ''
  showErrorDetails.value = false
  createEndpoint()
}

// Test endpoint
async function testEndpoint() {
  loading.value.test = true
  error.value.test = ''
  responseBody.value = null
  logs.value = []
  executionTime.value = null
  executionError.value = null

  try {
    // Parse request body
    let parsedBody
    try {
      parsedBody = JSON.parse(requestBody.value)
    } catch {
      error.value.test = 'Invalid JSON in request body'
      return
    }

    const response = await fetch(endpointUrl.value!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedBody),
    })

    const data = await response.json()

    if (data.error) {
      executionError.value = data.error
    } else {
      responseBody.value = data.result
    }

    logs.value = data.logs || []
    executionTime.value = data.durationMs || null
    
    if (!data.error) {
      showToast('Endpoint executed successfully', 'success', 2000)
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to execute endpoint'
    error.value.test = errorMessage
    errorDetails.value.test = err.stack || JSON.stringify(err, null, 2)
    showToast(errorMessage, 'error', 5000)
  } finally {
    loading.value.test = false
  }
}

// Retry test endpoint
function retryTestEndpoint() {
  error.value.test = ''
  errorDetails.value.test = ''
  showTestErrorDetails.value = false
  testEndpoint()
}

// Health check endpoint
const healthStatus = ref<'checking' | 'healthy' | 'error' | null>(null)
async function checkEndpointHealth() {
  if (!endpointUrl.value) return
  
  healthStatus.value = 'checking'
  showToast('Checking endpoint health...', 'info', 2000)
  
  try {
    const startTime = Date.now()
    const response = await fetch(endpointUrl.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      healthStatus.value = 'healthy'
      showToast(`✓ Endpoint is healthy (${responseTime}ms)`, 'success', 3000)
    } else {
      healthStatus.value = 'error'
      showToast('Endpoint returned an error', 'error', 3000)
    }
  } catch (err: any) {
    healthStatus.value = 'error'
    showToast('Endpoint is unreachable', 'error', 3000)
  }
}

// Copy curl command
async function copyCurlCommand() {
  if (!endpointUrl.value) return
  
  const curlCmd = `curl -X POST ${endpointUrl.value} \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.value.replace(/\n/g, '').replace(/\s+/g, ' ')}'`
  
  await copyToClipboard(curlCmd)
}

// Generate QR code data URL
const qrCodeUrl = computed(() => {
  if (!endpointUrl.value) return ''
  // Use a simple QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(endpointUrl.value)}`
})

const showQRCode = ref(false)

function toggleQRCode() {
  showQRCode.value = !showQRCode.value
  if (showQRCode.value) {
    showToast('QR code ready for scanning', 'info', 2000)
  }
}

// Close modal
function closeModal() {
  endpointUrl.value = null
  endpointId.value = null
  expiresAt.value = null
  createdEndpoint.value = null
  responseBody.value = null
  logs.value = []
  executionTime.value = null
  executionError.value = null
  error.value.test = ''
}

// Copy to clipboard with feedback
async function copyToClipboard(text: string, itemId?: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('Copied to clipboard!', 'success', 1500)
    
    // Add temporary copied state
    if (itemId) {
      copiedItems.value.add(itemId)
      setTimeout(() => {
        copiedItems.value.delete(itemId)
      }, 2000)
    }
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('Copied to clipboard!', 'success', 1500)
    
    if (itemId) {
      copiedItems.value.add(itemId)
      setTimeout(() => {
        copiedItems.value.delete(itemId)
      }, 2000)
    }
  }
}

// Helper to check if item was copied
function isCopied(itemId: string): boolean {
  return copiedItems.value.has(itemId)
}

// Format JSON for display
function formatJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

// Auth state is now initialized synchronously, no need to track initialization
</script>
