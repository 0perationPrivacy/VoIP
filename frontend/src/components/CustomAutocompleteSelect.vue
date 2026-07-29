<template>
  <div class="custom-select" :class="{ 'is-empty': options.length === 0 }" @click="toggleDropdown">
    <div class="selected-option" :class="{ placeholder: !selectedOption[labelProp] }">
      {{ selectedOption[labelProp] || (options.length ? 'Select a number' : 'Numbers will populate here') }}
    </div>
    <div class="dropdown" v-if="showDropdown">
      <input
        v-model="searchTerm"
        @input="filterOptions"
        @focus="showAllOptions"
        @blur="hideOptions"
        @keydown="handleKeyDown"
        ref="autocompleteInput"
      >
      <ul class="form-group">
        <li
          v-for="(option, index) in filteredOptions"
          :key="option[valueProp]"
          :class="{ 'highlighted': index === highlightedIndex }"
          @click="selectOption(option)"
        >
          {{ option[labelProp] }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true
    },
    value: {
      required: true
    },
    labelProp: {
      type: String,
      default: 'label'
    },
    valueProp: {
      type: String,
      default: 'value'
    }
  },
  data() {
    return {
      searchTerm: "",
      filteredOptions: [],
      showDropdown: false,
      highlightedIndex: -1,
    };
  },
  computed: {
    selectedOption() {
      return this.options.find(option => option[this.valueProp] === this.value) || {};
    },
    selectedValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit('input', newValue);
      },
    },
  },
  methods: {
    filterOptions() {
      this.showDropdown = true;
      this.filteredOptions = this.options.filter(option =>
        option[this.labelProp].toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    showAllOptions() {
      this.showDropdown = true;
      this.filteredOptions = this.options;
    },
    hideOptions() {
      setTimeout(() => {
        this.showDropdown = false;
      }, 2000);
    },
    onSelectOption() {
      this.searchTerm = '';
      this.filterOptions();
    },
    selectOption(option) {
      this.hideOptions();

      this.searchTerm = option[this.labelProp];
      this.selectedValue = option[this.labelProp];
      // this.$emit("onSelectOption", option);
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        this.$nextTick(() => this.$refs.autocompleteInput.focus());
      }
    },
    handleKeyDown(event) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.highlightNextOption();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.highlightPreviousOption();
          break;
        case 'Enter':
          event.preventDefault();
          this.selectHighlightedOption();
          break;
      }
    },
    highlightNextOption() {
      if (this.highlightedIndex < this.filteredOptions.length - 1) {
        this.highlightedIndex++;
      }
    },
    highlightPreviousOption() {
      if (this.highlightedIndex > 0) {
        this.highlightedIndex--;
      }
    },
    selectHighlightedOption() {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
        const option = this.filteredOptions[this.highlightedIndex];
        this.selectOption(option);
      }
    },
  },
};
</script>

<style scoped>
.custom-select {
  position: relative;
  display: block;
  width: 100%;
}

.custom-select.is-empty {
  cursor: not-allowed;
}

.selected-option {
  min-height: 20px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--background-color-secondary);
  color: var(--text-primary-color);
  cursor: pointer;
}

.custom-select.is-empty .selected-option {
  background-color: var(--background-color-secondary);
  opacity: 0.6;
  cursor: not-allowed;
}

.selected-option.placeholder {
  color: var(--text-tertiary);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 20;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

input {
  width: 100%;
  padding: 10px 14px;
  border: none;
  background-color: var(--surface);
  color: var(--text-primary-color);
  box-sizing: border-box;
}

input:focus {
  outline: none;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

li {
  cursor: pointer;
  padding: 8px 14px;
}

li:hover, li.highlighted {
  background-color: var(--contact-hover);
}
</style>
