<template>
    <div>
        <b-icon class="pointer-icon m-2" font-scale="1" icon="person-lines-fill" aria-hidden="true" title="Contacts" v-b-toggle.sidebar-right></b-icon>
        <b-sidebar id="sidebar-right" right shadow no-header backdrop>
            <template #default="{ hide }">
                <div class="d-flex flex-row mt-2 justify-content-between bd-highlight">
                    <div class="bd-highlight dropDown">
                        <b-button class="float-left d-flex m-1" size="sm" variant="primary">
                          <b-icon @click="hide" icon="x" scale="1"></b-icon>
                        </b-button>
                    </div>
                    <div >
                        <div class="d-flex justify-content-start">
                            <div class="ml-1">
                                <b-button v-b-tooltip.hover title="Add Contact" @click="openContactModel()" class="float-left d-flex m-1" size="sm" variant="primary">
                                    <b-icon icon="plus-circle" scale="1"></b-icon>
                                </b-button>
                            </div>
                            <div class="ml-2">
                              <b-button v-b-tooltip.hover title="Export Contact" @click="exportContact()" class="float-left d-flex m-1" size="sm" variant="primary">
                                    <b-icon icon="cloud-download" scale="1"></b-icon>
                                </b-button>
                            </div>
                            <div class="ml-2">
                              <b-button v-b-tooltip.hover title="Delete All Contact" @click="deleteAll()" class="float-left d-flex m-1" size="sm" variant="danger">
                                    <b-icon icon="trash-fill" scale="1"></b-icon>
                                </b-button>
                            </div>
                            <div>
                                <h4 class="pr-3 m-1">
                                    Contacts
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                  <ul class="list-group">
                    <li v-for="contact in contacts" :key="contact._id" class="list-group-item d-flex justify-content-between align-items-center">
                      <div class="d-flex flex-column bd-highlight">
                        <div class="bd-highlight">
                          {{contact.first_name}} {{contact.last_name}}
                        </div>
                        <div class="bd-highlight">{{contact.number}}</div>
                      </div>
                      <div>
                        <b-icon icon="pencil-square" title="Update" style="cursor: pointer;" @click="updateContact(contact)"></b-icon>
                        <b-icon icon="trash-fill" title="Delete" style="cursor: pointer;" @click="deletechat(contact._id)"></b-icon>
                      </div>
                    </li>
                  </ul>
                </div>
            </template>
        </b-sidebar>

        <b-modal  ref="modal-contact" id="modal-contact" title="Contact" hide-footer>
           <div class="card mt-4">
          <div class="card-body">
            <b-tabs content-class="mt-3">
              <b-tab title="Add Contact" active>
                <form @submit.prevent="handleSubmit">
                  <div class=" form-group m-auto mb-2">
                    <label>First Name</label>
                    <input class="form-control" type="text" placeholder="First Name" v-model="form.first_name" id="first_name" name="first_name" :class="{ 'is-invalid': submitted && $v.form.first_name.$error }"  />
                    <div v-if="submitted && !$v.form.first_name.required" class="invalid-feedback">First Name is required</div>
                  </div>
                  <div class="form-group m-auto mb-2">
                    <label>Last Name</label>
                    <input class="form-control" type="text" placeholder="Last Name" v-model="form.last_name" id="last_name" name="last_name"  />
                  </div>
                  <div class="form-group m-auto mb-2">
                    <label>Number</label>
                    <input class="form-control" type="text" placeholder="Number" v-model="form.number" id="number" name="number" :class="{ 'is-invalid': submitted && $v.form.number.$error }"  />
                    <div v-if="submitted && !$v.form.number.required" class="invalid-feedback">Number is required</div>
                    <div v-if="submitted && !$v.form.number.phonenumber" class="invalid-feedback">Please enter valid number. </div>
                  </div>

                  <div class="form-group m-auto mb-2">
                    <label>Note</label>
                    <input class="form-control" type="text" placeholder="Note" v-model="form.note" id="note" name="note"  />
                  </div>
                  <div class="d-flex justify-content-start bd-highlight">
                    <div class="bd-highlight"><button type="submit" class="btn btn-primary float-right">Save</button></div>
                  </div>
                </form>
              </b-tab>
              <b-tab title="Add Multiple">
                <div class="d-flex justify-content-end">
                  <button class="btn btn-success mb-2 float-right" @click="download()">Sample File</button>
                </div>
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text paperClip chat-input" @click="choseFile2()" id="basic-addon1"><b-icon icon="paperclip" ></b-icon></span>
                  </div>
                  <input type="text" class="form-control csv_field_input chat-input" @click="choseFile2()" placeholder="Choose file" v-model="modelFileValu" aria-label="Username" readonly aria-describedby="basic-addon1">
                </div>
                <div class="form-group mb-2 mt-4 d-none">
                  <input type="file" id="model_file_input2" class="form-control chat-input" name="csvFile" accept=".csv" @change="onSelect($event)">
                </div>
                <div class="d-flex justify-content-start bd-highlight">
                  <div class="bd-highlight"><button type="button" @click="handleSubmit2()" class="btn btn-primary float-right">Save</button></div>
                </div>
              </b-tab>
            </b-tabs>
          </div>
        </div>
        </b-modal>
    </div>
</template>
<script>
import { post } from '../../core/module/common.module'
import { required, helpers } from 'vuelidate/lib/validators'
import Papa from 'papaparse'
// eslint-disable-next-line no-useless-escape
const phonenumber = helpers.regex('phonenumber', /^\+?[0-9\(\-\)\ ]{3,17}$/)
export default {
  props: ['contacts'],
  data () {
    return {
      access_token: null,
      headers: null,
      baseurl: '',
      modelFileValu: '',
      submitted: false,
      userdata: null,
      editId: false,
      csvFile: null,
      submitted2: false,
      form: {
        first_name: '',
        last_name: '',
        number: '',
        note: ''
      },
      jsonData: [
        {
          'first_name': 'John',
          'last_name': 'Doe',
          'number': '12300XXXXX',
          'note': 'notes go here'
        }
      ],
      csvUploadArray2: []
      // contacts: []
    }
  },
  validations: {
    form: {
      first_name: { required },
      last_name: {},
      number: { required, phonenumber },
      note: {}
    }
  },
  mounted: function () {
    // this.getContacts()
  },
  methods: {
    exportContact () {
      this.downloadFile(this.contacts, 'contacts')
    },
    emptyContact () {
      this.form.first_name = ''
      this.form.last_name = ''
      this.form.number = ''
      this.form.note = ''
    },

    async onSelect (event) {
      this.csvFile = true
      console.log(event)
      this.modelFileValu = event.target.files[0].name
      const fileToRead = event.target.files[0]
      var fileData = await this.readFile(fileToRead)
      this.csvUploadArray2 = fileData
      console.log(this.csvUploadArray2)
    },
    readFile (file) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsText(file, 'UTF-8')
        fileReader.onload = (e) => {
          const textFromFileLoaded = e.target.result
          let options = {
            complete: (results, file) => {
              this.csvUploadArray = results.data
            }
          }
          Papa.parse(textFromFileLoaded, options)
          var array = []
          var csvdata = this.csvUploadArray
          for (var i = 0; i < csvdata.length; ++i) {
            if (i !== 0) {
              if (csvdata[i][0] !== '' && csvdata[i][0] !== undefined && isNaN(csvdata[i][0])) {
                var arrayData = {
                  'first_name': csvdata[i][0],
                  'last_name': csvdata[i][1],
                  'number': csvdata[i][2],
                  'note': csvdata[i][3]
                }
                array.push(arrayData)
              }
            }
          }
          resolve(array)
        }
      })
    },
    choseFile2 () {
      document.getElementById('model_file_input2').click()
    },
    downloadFile (data, filename = 'data') {
      let csvData = this.ConvertToCSV(data, ['first_name', 'last_name', 'number', 'note'])
      console.log(csvData)
      let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' })
      let dwldLink = document.createElement('a')
      let url = URL.createObjectURL(blob)
      let isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1
      if (isSafariBrowser) {
        dwldLink.setAttribute('target', '_blank')
      }
      dwldLink.setAttribute('href', url)
      dwldLink.setAttribute('download', filename + '.csv')
      dwldLink.style.visibility = 'hidden'
      document.body.appendChild(dwldLink)
      dwldLink.click()
      document.body.removeChild(dwldLink)
    },
    download () {
      this.downloadFile(this.jsonData, 'sample_file')
    },
    ConvertToCSV (objArray, headerList) {
      let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
      let str = ''
      let row = ''

      for (let index in headerList) {
        console.log(index)
        console.log(headerList[index])
        row += headerList[index] + ','
      }
      row = row.slice(0, -1)
      str += row + '\r\n'
      for (let i = 0; i < array.length; i++) {
        let line = ''
        for (let index in headerList) {
          let head = headerList[index]

          line += array[i][head] + ','
        }
        str += line + '\r\n'
      }
      return str
    },
    openContactModel () {
      this.editId = false
      this.emptyContact()
      this.$refs['modal-contact'].show()
    },
    handleSubmit (e) {
      this.submitted = true
      // stop here if form is invalid
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      // eslint-disable-next-line no-undef
      if (this.editId) {
        var data = this.form
        // eslint-disable-next-line no-undef
        data.contact_id = this.editId
        var request = {
          data: data,
          url: 'contact/update'
        }
      } else {
        // eslint-disable-next-line no-redeclare
        var request = {
          data: this.form,
          url: 'contact/create'
        }
      }
      this.$store
        .dispatch(post, request)
        .then((data) => {
          this.$refs['modal-contact'].hide()
          // this.getContacts()
          this.$emit('onaddContact', true)
          this.emptyContact()
          this.submitted = false
        })
        .catch((e) => {
          console.log(e)
        })
    },

    handleSubmit2 () {
      if (this.csvUploadArray2.length > 0) {
        var data = {
          contacts: this.csvUploadArray2
        }
        var request = {
          data: data,
          url: 'contact/multiple-add'
        }
        this.$store
          .dispatch(post, request)
          .then((data) => {
            this.$refs['modal-contact'].hide()
            this.$emit('onaddContact', true)
            this.modelFileValu = ''
          })
          .catch((e) => {
            console.log(e)
          })
      } else {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: 'Please upload valid file!'
        })
      }
    },
    deletechat (id) {
      // eslint-disable-next-line no-undef
      this.$swal.fire({
        icon: 'info',
        title: 'Do you want to delete this contact?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Yes, Delete`,
        denyButtonText: `No`
      }).then((result) => {
        if (result.isConfirmed) {
          var request = {
            data: {contact_id: id},
            url: 'contact/delete'
          }
          this.$store
            .dispatch(post, request)
            .then((data) => {
              this.$swal({
                icon: 'success',
                title: 'Success',
                text: 'Contact Deleted successfully!'
              })
              this.$emit('onaddContact', true)
              // this.getContacts()
              // this.$refs['modal-contact'].hide()
            })
            .catch((e) => {
              console.log(e)
            })
          // contact/delete
          // var messageData = {user: this.userdata._id, number: this.activeChat}
          // eslint-disable-next-line no-undef
        } else if (result.isDenied) {
          // eslint-disable-next-line no-undef
          this.$swal.fire('contact not deleted', '', 'info')
        }
      })
    },
    updateContact (contact) {
      this.editId = contact._id
      this.form = {
        first_name: contact.first_name,
        last_name: contact.last_name,
        number: contact.number,
        note: contact.note
      }
      this.$refs['modal-contact'].show()
    },
    deleteAll () {
      this.$swal.fire({
        icon: 'info',
        title: 'Are you sure you want to delete ALL contacts?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Yes, Delete all`,
        denyButtonText: `No`
      }).then((result) => {
        if (result.isConfirmed) {
          var request = {
            data: {},
            url: 'contact/deleteall'
          }
          this.$store
            .dispatch(post, request)
            .then((data) => {
              this.$swal({
                icon: 'success',
                title: 'Success',
                text: 'All contacts deleted successfully'
              })
              this.$emit('onaddContact', true)
              // this.getContacts()
              // this.$refs['modal-contact'].hide()
            })
            .catch((e) => {
              console.log(e)
            })
          // contact/delete
          // var messageData = {user: this.userdata._id, number: this.activeChat}
          // eslint-disable-next-line no-undef
        } else if (result.isDenied) {
          // eslint-disable-next-line no-undef
          this.$swal.fire('contacts not deleted', '', 'info')
        }
      })
    }
  }
}
</script>
<style scoped>
 .pointer-icon{
     cursor: pointer;
 }
 .close {
    margin: 0 !important;
}
.paperClip{
  border-radius: 0% !important;
  border-top-left-radius: 5px !important;
  border-bottom-left-radius: 5px !important;
  padding: 0.5rem 0.75rem !important;
  border-right: 1px solid lightgray;
  background: white !important;
}
.csv_field_input{
  background: white !important;
  color: black !important;
}
</style>
