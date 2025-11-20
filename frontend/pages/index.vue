<template>
  <div class="min-h-screen relative">
    <!-- Skeleton loader while auth initializes -->
    <SkeletonLoader v-if="!authInitialized" :show-dashboard="false" />

    <!-- Main content after auth is initialized -->
    <div v-else>
      <div v-if="!isAuthenticated" class="radial-gradient absolute top-0 md:right-14 right-5"></div>
      
      <!-- User Header (only for authenticated users) -->
      <UserHeader v-if="isAuthenticated" />
    
    <!-- Public Header (for non-authenticated users) -->
    <header v-else class="border-b border-gray-500/20 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
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
    <div class="py-12 px-4 sm:px-6 lg:px-0 antialiased">
      <div :class="isAuthenticated ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'">
        <!-- Hero Section (only for non-authenticated users) -->
        <div v-if="!isAuthenticated" class="mt-6 md:mt-12 max-w-4xl mb-20">
          <h1 class="mb-5 text-3xl font-bold sm:mb-6 sm:text-5xl leading-tight text-white">
            Turn your <span class="bg-blue-300 px-1 text-black">code</span> into <span class="bg-amber-300 px-1 text-black">API</span> instantly
          </h1>
          <p class="text-gray-400 text-sm leading-[1.6] sm:text-base">
            Paste your code or upload a file, and get a 
            secure endpoint you can call from anywhere. 
            No servers, no deploy, no config.
          </p>
        </div>
        <!-- Two Column Layout (authenticated) or Single Column (non-authenticated) -->
        <div :class="isAuthenticated ? 'grid grid-cols-1 lg:grid-cols-5 gap-6' : ''">
          <!-- Main Card -->
          <div :class="isAuthenticated ? 'lg:col-span-3' : ''">
            <div class="border bg-gray-500/5 border-gray-500/15 relative inner-container -mb-px -ml-px">
              <div class="border border-t-0 border-l-0 border-r-0 border-gray-500/10">
                <div>
                  <!-- Mode Tabs -->
                  <div class="border-b border-gray-500/10">
                    <div class="flex">
                      <button
                        @click="switchToSnippetMode"
                        :class="[
                          'px-6 py-3 text-sm font-medium transition-colors',
                          mode === 'snippet'
                            ? 'text-white border-b-2 border-blue-300'
                            : 'text-gray-400 hover:text-white'
                        ]"
                      >
                        Snippet
                      </button>
                      <button
                        v-if="isAuthenticated"
                        @click="switchToFileMode"
                        :class="[
                          'px-6 py-3 text-sm font-medium transition-colors',
                          mode === 'file'
                            ? 'text-white border-b-2 border-blue-300'
                            : 'text-gray-400 hover:text-white'
                        ]"
                      >
                        File Upload
                      </button>
                      <button
                        @click="switchToFrameworkMode"
                        :class="[
                          'px-6 py-3 text-sm font-medium transition-colors',
                          mode === 'framework'
                            ? 'text-white border-b-2 border-blue-300'
                            : 'text-gray-400 hover:text-white'
                        ]"
                      >
                        Framework
                      </button>
                      <button
                        v-if="isAuthenticated"
                        @click="switchToFunctionMode"
                        :class="[
                          'px-6 py-3 text-sm font-medium transition-colors',
                          mode === 'function'
                            ? 'text-white border-b-2 border-blue-300'
                            : 'text-gray-400 hover:text-white'
                        ]"
                      >
                        Function
                      </button>
                      <button
                        v-if="isAuthenticated"
                        @click="switchToStreamMode"
                        :class="[
                          'px-6 py-3 text-sm font-medium transition-colors',
                          mode === 'stream'
                            ? 'text-white border-b-2 border-blue-300'
                            : 'text-gray-400 hover:text-white'
                        ]"
                      >
                        Stream
                      </button>
                    </div>
                  </div>

                  <!-- Configuration Panel (hidden for Framework, Function, and Stream modes) -->
                  <div v-if="mode !== 'framework' && mode !== 'function' && mode !== 'stream'" class="p-4 border-b border-gray-500/10">
                    <!-- Optional Fields -->
                    <div :class="isAuthenticated ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''">
                      <!-- Name field (only for authenticated users) -->
                      <div v-if="isAuthenticated">
                        <input
                          v-model="endpointName"
                          :disabled="loading.create"
                          type="text"
                          placeholder="Enter a name for your API"
                          class="block w-full rounded-lg bg-gray-500/5 py-2.5 px-4 text-sm font-medium text-white placeholder:text-gray-500 border border-gray-500/10 hover:bg-gray-500/10 focus:outline-none focus:ring-2 focus:ring-gray-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        />
                      </div>
                      <!-- Example Buttons (for snippet mode) -->
                      <div v-if="mode === 'snippet'" class="relative flex items-end">
                        <select
                          @change="loadExample(($event.target as HTMLSelectElement).value)"
                          :disabled="loading.create"
                          class="block w-full appearance-none rounded-lg bg-gray-500/5 py-2.5 pl-4 pr-10 text-sm font-medium text-white border border-gray-500/10 hover:bg-gray-500/15 focus:outline-none focus:ring-2 focus:ring-gray-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <option value="">Select an example...</option>
                          <option v-for="(example, idx) in examples" :key="idx" :value="idx">
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

                  <!-- Code Editor or File Upload -->
                  <div v-if="mode === 'snippet'" class="bg-black relative">
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

                  <!-- File Upload Mode -->
                  <div v-else-if="mode === 'file'" class="p-8 bg-black">
                    <div class="max-w-xl mx-auto">
                      <label class="block">
                        <div 
                          @dragenter="handleDragEnter"
                          @dragleave="handleDragLeave"
                          @dragover="handleDragOver"
                          @drop="handleDrop"
                          :class="[
                            'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
                            isDragging 
                              ? 'border-blue-400 bg-blue-500/10 scale-105' 
                              : 'border-gray-500/30 hover:border-gray-500/50'
                          ]"
                        >
                          <input
                            type="file"
                            ref="fileInput"
                            @change="handleFileSelect"
                            accept=".js,.ts,.py"
                            class="hidden"
                            :disabled="loading.create"
                          />
                          <svg 
                            :class="[
                              'w-12 h-12 mx-auto mb-4 transition-colors',
                              isDragging ? 'text-blue-400' : 'text-gray-400'
                            ]" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div v-if="selectedFile" class="mb-2">
                            <p class="text-white font-medium">{{ selectedFile.name }}</p>
                            <p class="text-xs text-gray-400">{{ formatFileSize(selectedFile.size) }}</p>
                          </div>
                          <p v-else :class="['mb-1', isDragging ? 'text-blue-400 font-medium' : 'text-gray-400']">
                            {{ isDragging ? 'Drop file to upload' : 'Drop your file here or click to browse' }}
                          </p>
                          <p class="text-xs text-gray-500">Supports .js, .ts, .py (max 64KB)</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <!-- Framework Mode -->
                  <div v-else-if="mode === 'framework'" class="p-8 bg-black">
                    <div class="max-w-2xl mx-auto">
                      <div class="flex items-start space-x-3 mb-6">
                        <svg class="w-8 h-8 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <div>
                          <h3 class="text-lg font-semibold text-white mb-2">Framework</h3>
                          <p class="text-gray-400 text-sm leading-relaxed mb-4">
                            Already have a backend running? (NestJS, Express, FastAPI, etc.) Expose any local route to the internet instantly with our CLI.
                          </p>
                        </div>
                      </div>
                      
                      <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                        <div class="mb-4">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Terminal</p>
                          <div class="flex items-center justify-between bg-black rounded-lg p-3 font-mono text-sm">
                            <code class="text-green-300">npx @instantapihq/cli expose http://localhost:3000/api/users/create</code>
                            <button 
                              @click="copyFrameworkCommand"
                              class="ml-3 text-gray-400 hover:text-white transition-colors"
                              title="Copy command"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div class="bg-gray-500/10 border border-gray-500/10 rounded-lg p-4">
                          <p class="text-sm text-gray-400">
                            <span class="font-semibold">Note:</span> Your local backend must be running and reachable. The CLI forwards requests from the public URL to your localhost.
                          </p>
                        </div>
                      </div>

                      <!-- Active Tunnels -->
                      <div v-if="tunnels.length > 0" class="border-t border-gray-500/10 pt-4">
                        <h3 class="text-sm font-semibold text-gray-300 mb-3">Active Tunnels</h3>
                        <div class="space-y-2">
                          <div
                            v-for="tunnel in tunnels"
                            :key="tunnel.id"
                            class="flex items-center justify-between p-3 bg-gray-500/5 rounded border border-gray-500/10"
                          >
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-mono text-blue-300 truncate">
                                /t/{{ tunnel.id }}
                              </p>
                              <p class="text-xs text-gray-500 truncate">
                                → {{ tunnel.targetUrl }}
                              </p>
                            </div>
                            <div class="shrink-0 ml-4">
                              <span class="inline-flex items-center gap-1 text-xs text-green-400">
                                <span class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Function Mode -->
                  <div v-else-if="mode === 'function'" class="p-8 bg-black">
                    <div class="max-w-2xl mx-auto">
                      <div class="flex items-start space-x-3 mb-6">
                        <svg class="w-8 h-8 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <div>
                          <h3 class="text-lg font-semibold text-white mb-2">Function SDK</h3>
                          <p class="text-gray-400 text-sm leading-relaxed mb-4">
                            Expose single functions without setting up a full server.
                          </p>
                        </div>
                      </div>
                      
                      <div class="space-y-4">
                        <!-- Install SDK -->
                        <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Install SDK</p>
                          <div class="flex items-center justify-between bg-black rounded-lg p-3 font-mono text-sm">
                            <code class="text-green-300">npm install @instantapihq/sdk</code>
                            <button 
                              @click="copyInstallCommand"
                              class="ml-3 text-gray-400 hover:text-white transition-colors"
                              title="Copy command"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <!-- Create functions -->
                        <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">functions.ts</p>
                          <pre class="bg-black rounded-lg p-4 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-purple-300">import</span> { <span class="text-blue-300">expose</span> } <span class="text-purple-300">from</span> <span class="text-green-300">'@instantapihq/sdk'</span>;

<span class="text-blue-300">expose</span>(<span class="text-green-300">'hello'</span>, (<span class="text-orange-300">input</span>) => {
  <span class="text-purple-300">return</span> {
    message: <span class="text-green-300">`Hello \${<span class="text-orange-300">input</span>.name}!`</span>
  };
});</code></pre>
                        </div>
                        
                        <!-- Expose by function name -->
                        <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Expose by function name</p>
                          <div class="flex items-center justify-between bg-black rounded-lg p-3 font-mono text-sm">
                            <code class="text-green-300">npx @instantapihq/cli expose hello</code>
                            <button 
                              @click="copyExposeCommand"
                              class="ml-3 text-gray-400 hover:text-white transition-colors"
                              title="Copy command"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Stream Mode -->
                  <div v-else-if="mode === 'stream'" class="p-8 bg-black">
                    <div class="max-w-2xl mx-auto">
                      <div class="flex items-start space-x-3 mb-6">
                        <svg class="w-8 h-8 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <div>
                          <h3 class="text-lg font-semibold text-white mb-2">Streaming</h3>
                          <p class="text-gray-400 text-sm leading-relaxed mb-4">
                            Expose streaming endpoints (SSE, WebSockets) from your local server to the internet instantly.
                          </p>
                        </div>
                      </div>
                      
                      <div class="space-y-4">
                        <!-- Framework with Streaming -->
                        <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Expose Streaming Endpoint</p>
                          <div class="flex items-center justify-between bg-black rounded-lg p-3 font-mono text-sm mb-4">
                            <code class="text-green-300">npx @instantapihq/cli expose http://localhost:3000/api/stream</code>
                            <button 
                              @click="copyStreamCommand"
                              class="ml-3 text-gray-400 hover:text-white transition-colors"
                              title="Copy command"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <div class="bg-gray-500/10 border border-gray-500/10 rounded-lg p-4">
                            <p class="text-sm text-gray-400 mb-2">
                              <span class="font-semibold">How it works:</span>
                            </p>
                            <ul class="text-sm text-gray-400 space-y-1 list-disc list-inside">
                              <li>Automatically detects SSE and WebSocket requests</li>
                              <li>Forwards streaming responses in real-time</li>
                              <li>Supports Server-Sent Events (text/event-stream)</li>
                              <li>Supports WebSocket upgrades</li>
                            </ul>
                          </div>
                        </div>

                        <!-- SSE Example -->
                        <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Server-Sent Events Example (Express)</p>
                          <pre class="bg-black rounded-lg p-4 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-purple-300">app</span>.<span class="text-blue-300">get</span>(<span class="text-green-300">'/api/stream'</span>, (<span class="text-orange-300">req</span>, <span class="text-orange-300">res</span>) => {
  <span class="text-orange-300">res</span>.<span class="text-blue-300">setHeader</span>(<span class="text-green-300">'Content-Type'</span>, <span class="text-green-300">'text/event-stream'</span>);
  <span class="text-orange-300">res</span>.<span class="text-blue-300">setHeader</span>(<span class="text-green-300">'Cache-Control'</span>, <span class="text-green-300">'no-cache'</span>);
  <span class="text-orange-300">res</span>.<span class="text-blue-300">setHeader</span>(<span class="text-green-300">'Connection'</span>, <span class="text-green-300">'keep-alive'</span>);

  <span class="text-purple-300">let</span> count = <span class="text-yellow-300">0</span>;
  <span class="text-purple-300">const</span> interval = <span class="text-blue-300">setInterval</span>(() => {
    <span class="text-orange-300">res</span>.<span class="text-blue-300">write</span>(<span class="text-green-300">`data: </span><span class="text-yellow-300">\${</span>JSON.<span class="text-blue-300">stringify</span>({ count: count++ })<span class="text-yellow-300">}</span><span class="text-green-300">\n\n`</span>);
  }, <span class="text-yellow-300">1000</span>);

  <span class="text-orange-300">req</span>.<span class="text-blue-300">on</span>(<span class="text-green-300">'close'</span>, () => {
    <span class="text-blue-300">clearInterval</span>(interval);
  });
});</code></pre>
                        </div>

                        <!-- Client Example -->
                        <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-6">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Client Example</p>
                          <pre class="bg-black rounded-lg p-4 text-sm overflow-x-auto"><code class="text-gray-300"><span class="text-purple-300">const</span> eventSource = <span class="text-purple-300">new</span> <span class="text-blue-300">EventSource</span>(<span class="text-green-300">'https://api.instantapi.dev/t/YOUR_TUNNEL_ID'</span>);

eventSource.<span class="text-blue-300">onmessage</span> = (<span class="text-orange-300">event</span>) => {
  <span class="text-purple-300">const</span> data = JSON.<span class="text-blue-300">parse</span>(<span class="text-orange-300">event</span>.data);
  console.<span class="text-blue-300">log</span>(<span class="text-green-300">'Received:'</span>, data);
};</code></pre>
                        </div>
                      </div>
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

                  <!-- Configuration and Create Button (hidden for Framework, Function, and Stream modes) -->
                  <div v-if="mode !== 'framework' && mode !== 'function' && mode !== 'stream'" class="flex justify-between items-end p-4 border-t border-gray-500/10">
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

                      <!-- TTL Select -->
                      <div class="relative">
                        <label class="block text-xs font-semibold mb-2 text-gray-300">Expires In</label>
                        <select
                          v-model="ttlHours"
                          :disabled="loading.create || !isAuthenticated"
                          class="block w-full appearance-none rounded-lg bg-gray-500/5 py-2.5 pl-4 pr-10 text-sm font-medium text-white border border-gray-500/10 hover:bg-gray-500/10 focus:outline-none focus:ring-2 focus:ring-gray-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <option :value="1">1 hour</option>
                          <option v-if="isAuthenticated" :value="24">24 hours</option>
                          <option v-if="isAuthenticated" :value="168">7 days</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 pt-6">
                          <svg class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                          </svg>
                        </div>
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
                <div>
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
              </div>

              <!-- Test Request Section -->
              <div class="border-t border-gray-500/20 pt-8">
                <h3 class="text-lg font-medium mb-4 text-white">Test it now</h3>

                <!-- Request Body -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2 text-gray-300">
                    Request Body (JSON)
                    <span v-if="!jsonValidationError" class="text-green-300 text-xs ml-2">✓ Valid</span>
                  </label>
                  <textarea
                    v-model="requestBody"
                    :class="[
                      'input-field font-mono text-sm',
                      jsonValidationError ? 'border-red-400/10 focus:ring-red-400/10' : ''
                    ]"
                    rows="6"
                    :disabled="loading.test"
                  ></textarea>
                  <!-- JSON Validation Error -->
                  <div v-if="jsonValidationError" class="mt-2 p-2 bg-yellow-300/10 border border-yellow-300/10 rounded text-yellow-300 text-xs flex items-start gap-2">
                    <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ jsonValidationError }}</span>
                  </div>
                </div>

                <!-- Error Display -->
                <div v-if="error.test" class="mb-4">
                  <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-start gap-2 flex-1">
                        <svg class="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="flex-1">
                          <p class="text-red-400 text-sm font-medium">{{ error.test }}</p>
                          <div v-if="errorDetails.test" class="mt-2">
                            <button
                              @click="showTestErrorDetails = !showTestErrorDetails"
                              class="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
                            >
                              <svg class="w-3 h-3" :class="showTestErrorDetails ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                              </svg>
                              {{ showTestErrorDetails ? 'Hide' : 'Show' }} details
                            </button>
                            <pre v-if="showTestErrorDetails" class="mt-2 p-3 bg-black/30 rounded text-xs text-red-300 overflow-x-auto">{{ errorDetails.test }}</pre>
                          </div>
                        </div>
                      </div>
                      <button
                        @click="retryTestEndpoint"
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

                <!-- Send Button -->
                <button
                  @click="testEndpoint"
                  :disabled="loading.test"
                  class="btn-primary w-full mb-6 flex items-center justify-center gap-2"
                >
                  <!-- Loading Spinner -->
                  <svg v-if="loading.test" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-if="loading.test">Sending...</span>
                  <span v-else>Test Endpoint</span>
                </button>

                <!-- Response Display -->
                <div v-if="responseBody !== null || executionError" class="space-y-4">
                  <!-- Error -->
                  <div v-if="executionError">
                    <label class="block text-sm font-medium mb-2 text-gray-300">
                      Error
                    </label>
                    <div class="p-4 bg-red-400/10 border border-red-400/20 rounded text-red-400 text-sm">
                      <div class="font-medium">{{ executionError.message }}</div>
                      <div v-if="executionError.stack" class="mt-2 text-xs opacity-75 font-mono">{{ executionError.stack }}</div>
                    </div>
                  </div>

                  <!-- Result -->
                  <div v-if="responseBody !== null && !executionError">
                    <label class="block text-sm font-medium mb-2 text-gray-300">
                      Response
                      <span v-if="executionTime" class="text-gray-500 text-xs ml-2">
                        ({{ executionTime }}ms)
                      </span>
                    </label>
                    <pre class="code-block text-green-300">{{ formatJson(responseBody) }}</pre>
                  </div>

                  <!-- Logs -->
                  <div v-if="responseBody !== null || executionError">
                    <label class="block text-sm font-medium mb-2 text-gray-300">
                      Logs
                    </label>
                    <div v-if="logs && logs.length > 0" class="code-block text-gray-400 max-h-64 overflow-y-auto">
                      <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
                    </div>
                    <div v-else class="p-4 bg-gray-500/5 border border-gray-500/10 rounded text-gray-500 text-sm text-center italic">
                      No console logs produced
                  </div>
                </div>
              </div>
              </div>
                    </div>
                  </Transition>
                </div>
              </Transition>
            </Teleport>
          </div>
        
          <!-- My APIs Dashboard (right column for authenticated users) -->
          <div v-if="isAuthenticated" class="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
            <h2 class="text-lg font-bold text-white mb-4">My APIs</h2>
            
            <div v-if="loading.dashboard" class="text-center py-8">
              <svg class="animate-spin h-6 w-6 text-blue-300 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-400 mt-3 text-sm">Loading...</p>
            </div>

            <div v-else-if="!endpoints.length && !tunnels.length" class="border border-gray-500/15 rounded-lg p-8 text-center bg-gray-500/5">
              <div class="flex flex-col items-center space-y-4">
                <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <div class="space-y-1">
                  <p class="text-white text-sm font-medium">No APIs yet</p>
                  <p class="text-gray-400 text-xs">Create your first API to get started</p>
                </div>
                <button 
                  @click="switchToSnippetMode"
                  class="mt-2 px-4 py-2 bg-blue-300/10 hover:bg-blue-300/20 text-blue-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Create Your First API →
                </button>
              </div>
            </div>

            <div v-else class="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Endpoints Section -->
              <div v-if="endpoints.length > 0">
                <h3 class="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Endpoints ({{ endpoints.length }})</h3>
                <div class="space-y-2">
                  <div v-for="endpoint in paginatedEndpoints" :key="endpoint.id" class="border border-gray-500/15 rounded-lg p-3 bg-gray-500/5 hover:bg-gray-500/10 transition-colors">
                    <div class="space-y-2">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs px-1.5 py-0.5 rounded bg-blue-300/10 text-blue-300">{{ endpoint.kind }}</span>
                        <span class="text-xs px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">{{ endpoint.language }}</span>
                        <span v-if="endpoint.name" class="text-xs font-medium text-white truncate">{{ endpoint.name }}</span>
                      </div>
                      <p v-if="endpoint.description" class="text-xs text-gray-400 line-clamp-2">{{ endpoint.description }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">{{ formatDate(endpoint.createdAt) }}</span>
                        <div class="flex gap-2">
                          <button 
                            @click="copyToClipboard(endpoint.url, `endpoint-${endpoint.id}`)" 
                            :class="[
                              'text-xs px-2 py-1 rounded transition-colors',
                              isCopied(`endpoint-${endpoint.id}`)
                                ? 'bg-green-300/10 text-green-300'
                                : 'bg-gray-500/10 text-gray-300 hover:bg-gray-500/20'
                            ]"
                          >
                            {{ isCopied(`endpoint-${endpoint.id}`) ? '✓ Copied' : 'Copy' }}
                          </button>
                          <button 
                            @click="confirmDeleteEndpoint(endpoint)" 
                            :disabled="deletingEndpointId === endpoint.id"
                            class="text-xs px-2 py-1 rounded bg-red-400/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {{ deletingEndpointId === endpoint.id ? '...' : 'Delete' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Show More Button for Endpoints -->
                <button 
                  v-if="hasMoreEndpoints"
                  @click="endpointsPage++"
                  class="mt-2 w-full text-xs py-2 px-3 rounded bg-gray-500/5 hover:bg-gray-500/10 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Show More ({{ endpoints.length - paginatedEndpoints.length }} more)
                </button>
              </div>

              <!-- Tunnels Section -->
              <div v-if="tunnels.length > 0" class="mt-4">
                <h3 class="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Tunnels ({{ tunnels.length }})</h3>
                <div class="space-y-2">
                  <div v-for="tunnel in paginatedTunnels" :key="tunnel.id" class="border border-gray-500/15 rounded-lg p-3 bg-gray-500/5 hover:bg-gray-500/10 transition-colors">
                    <div class="space-y-2">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs px-1.5 py-0.5 rounded bg-green-300/10 text-green-300">
                          {{ tunnel.targetUrl.includes('/fn/') ? 'function' : 'framework' }}
                        </span>
                        <span class="text-xs px-1.5 py-0.5 rounded" :class="tunnel.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'">
                          {{ tunnel.isActive ? 'active' : 'inactive' }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-400 font-mono truncate">→ {{ tunnel.targetUrl }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">{{ formatDate(tunnel.lastSeenAt) }}</span>
                        <button 
                          @click="copyToClipboard(`${API_BASE}/t/${tunnel.id}`, `tunnel-${tunnel.id}`)"
                          :class="[
                            'text-xs px-2 py-1 rounded transition-colors',
                            isCopied(`tunnel-${tunnel.id}`)
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-gray-500/10 text-gray-300 hover:bg-gray-500/20'
                          ]"
                        >
                          {{ isCopied(`tunnel-${tunnel.id}`) ? '✓ Copied' : 'Copy' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Show More Button for Tunnels -->
                <button 
                  v-if="hasMoreTunnels"
                  @click="tunnelsPage++"
                  class="mt-2 w-full text-xs py-2 px-3 rounded bg-gray-500/5 hover:bg-gray-500/10 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Show More ({{ tunnels.length - paginatedTunnels.length }} more)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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
const MAX_CODE_SIZE = 64 * 1024 // 64KB in bytes

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
  if (!isAuthenticated.value) return;
  
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
      console.log('📋 Fetched endpoints:', data);
      endpoints.value = data;
    } else {
      console.error('Failed to fetch endpoints:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Failed to fetch endpoints:', error);
  } finally {
    loading.value.dashboard = false;
  }
}

// Fetch user's tunnels
async function fetchTunnels() {
  if (!isAuthenticated.value) return;
  
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
    console.error('Failed to fetch tunnels:', error);
  }
}

// Fetch all dashboard data
async function fetchDashboard() {
  if (!isAuthenticated.value) return;
  await Promise.all([fetchEndpoints(), fetchTunnels()]);
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
  const savedDraft = localStorage.getItem(DRAFT_KEY)
  if (savedDraft) {
    try {
      const draft = JSON.parse(savedDraft)
      const savedTime = new Date(draft.timestamp)
      const hoursSince = (Date.now() - savedTime.getTime()) / (1000 * 60 * 60)
      
      // Only restore if saved within last 24 hours
      if (hoursSince < 24) {
        code.value = draft.code || ''
        language.value = draft.language || 'javascript'
        mode.value = draft.mode || 'snippet'
        kind.value = draft.kind || 'snippet'
        // Non-authenticated users can only use 1 hour TTL
        const restoredTTL = draft.ttlHours || 1
        ttlHours.value = isAuthenticated.value ? restoredTTL : 1
        endpointName.value = draft.endpointName || ''
        endpointDescription.value = draft.endpointDescription || ''
        // Draft restored silently - no need to notify
      }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
  
  // Fetch dashboard data on mount if authenticated
  if (isAuthenticated.value) {
    fetchDashboard()
  }
  
  // Refresh dashboard every 30 seconds if authenticated
  setInterval(() => {
    if (isAuthenticated.value) {
      fetchDashboard()
    }
  }, 30000)
  
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
        name: 'HTTP Request',
        code: `# Outbound HTTP example using http_get/http_post helpers
def handler(input):
    url = input.get('url', 'https://api.github.com/zen')
    
    # Simple GET request
    data = http_get(url)
    
    return {
        "url": url,
        "data": data,
        "timestamp": str(datetime.now())
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

// Switch to snippet mode and clear file
function switchToSnippetMode() {
  mode.value = 'snippet'
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Switch to file mode and clear code
function switchToFileMode() {
  mode.value = 'file'
  code.value = ''
}

// Switch to framework mode
function switchToFrameworkMode() {
  mode.value = 'framework'
  code.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
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

// Copy command helpers for Framework, Function, and Stream modes
async function copyFrameworkCommand() {
  const cmd = 'npx @instantapihq/cli expose http://localhost:3000/api/users/create'
  await copyToClipboard(cmd)
}

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
function loadExample(idx: string) {
  if (!idx) return
  const example = examples.value[parseInt(idx)]
  if (example) {
  code.value = example.code
  requestBody.value = example.testInput
  }
}

// Handle file selection
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Validate file size (64KB limit)
    const MAX_FILE_SIZE = 64 * 1024 // 64KB
    if (file.size > MAX_FILE_SIZE) {
      error.value.create = `File too large (${formatFileSize(file.size)}). Try removing comments or splitting into modules. Maximum size is 64KB.`
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

    console.log('✅ Created endpoint:', data);

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
    
    // Refresh dashboard if authenticated
    if (isAuthenticated.value) {
      console.log('🔄 Refreshing dashboard after endpoint creation...');
      await fetchDashboard()
    }
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

// No auth middleware - page is public but shows different content based on auth state
definePageMeta({
  middleware: [],
});

// Set page title
useHead({
  title: 'Instant API - Turn code into APIs instantly',
});

// Check auth state (auth is initialized by plugin)
const { isAuthenticated, initialized: authInitialized } = useAuth();

// Ensure non-authenticated users can only use 1 hour TTL and clear name/description
watch(isAuthenticated, (authenticated) => {
  if (!authenticated) {
    if (ttlHours.value > 1) {
      ttlHours.value = 1
    }
    // Clear name and description for non-authenticated users
    endpointName.value = ''
    endpointDescription.value = ''
    // Clear dashboard data
    endpoints.value = []
    tunnels.value = []
  } else {
    // Fetch dashboard data when user logs in
    fetchDashboard()
  }
});
</script>
