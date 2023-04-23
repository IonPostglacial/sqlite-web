<template>
    <table>
        <tr><th>Id</th><th>Name</th><th>Author</th><th>&nbsp;</th></tr>
        <tr v-for="row in rows" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.author }}</td>
            <td><button @click="deleteDb(row.id)">Delete</button></td>
        </tr>
        <tr>
            <td>{{ rows.length + 1 }}</td>
            <td><input type="text" v-model="newRow.name"></td>
            <td><input type="text" v-model="newRow.author"></td>
            <td><button @click="addDb">Add</button></td>
        </tr>
    </table>
    <button @click="resetDb">Reset</button>
    <button @click="exportDb">Export</button>
    <button @click="openFileChooser">Import</button>
    <input type="file" @change="importDb" class="hidden" ref="chooser">
</template>

<script setup lang="ts">
import { Ref, reactive, ref } from "vue";

type Row = {
    id: number,
    name: string,
    author: string,
};

const { worker } = defineProps({ worker: { type: Worker, required: true } });
const rows = ref(new Array<Row>());
const chooser: Ref<null|HTMLElement> = ref(null);
const newRow = reactive({ name: "", author: "" })

worker.onmessage = async function (e) {
    switch (e.data.kind) {
        case "rows":
            rows.value = e.data.rows;
            break;
        case "file": {
            const root = await navigator.storage.getDirectory();
            const handle = await root.getFileHandle(e.data.link);
            const file = await handle.getFile();
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${e.data.link}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }

    }
};

function addDb() {
    worker.postMessage({ action: "add", value: { name: newRow.name, author: newRow.author } });
}

function deleteDb(id: number) {
    worker.postMessage({ action: "delete", id });
}

function resetDb() {
    worker.postMessage({ action: "reset" });
}

function exportDb() {
    worker.postMessage({ action: "export" });
}

function openFileChooser() {
    chooser.value?.click();
}

function importDb(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (e.target.files?.length !== 1) return;
    const file = e.target.files[0];
    worker.postMessage({ action: "import", file });
}

</script>

<style scoped>
    table {
        table-layout: fixed;
        border-collapse: collapse;
    }

    table, td, th {
        border: 1px solid black;
    }

    td, th {
        padding: 0.5ch 1ch;
    }

    .hidden {
        display: none;
    }
</style>
