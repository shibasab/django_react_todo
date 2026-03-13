<template>
  <div :class="wrapperClassName">
    <label :for="id" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <select
      :id="id"
      :value="modelValue"
      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      @change="handleChange"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts" generic="TValue extends string">
export type SelectOption<T extends string> = Readonly<{
  value: T
  label: string
}>

const props = defineProps<{
  id: string
  label: string
  modelValue: TValue
  options: readonly SelectOption<TValue>[]
  wrapperClassName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TValue]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedOption = props.options.find((option) => option.value === target.value)
  if (selectedOption != null) {
    emit('update:modelValue', selectedOption.value)
  }
}
</script>
