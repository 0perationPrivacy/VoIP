<template>
  <div class="custom-select" @click="toggleDropdown">
    <div class="selected-option">
      {{ selectedOption[labelProp] }}
    </div>
    <div class="dropdown">
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
  display: inline-block;
  width: 100%;
}

.selected-option {
  padding: 8px 20px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
}

input {
  width: 100%;
  padding: 8px;
  border: none;
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
  padding: 5px;
}

li:hover {
  background-color: #f2f2f2;
}
</style>
