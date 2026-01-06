<template>
  <UiPage>
    <UiPageHeader title="Application Detail" subtitle="Timeline and attachments" />
    <UiSection>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <p><strong>ID:</strong> {{ application?.id }}</p>
        <p><strong>Applicant:</strong> {{ application?.applicantName }}</p>
        <p><strong>Program:</strong> {{ application?.program }}</p>
        <p><strong>Status:</strong> {{ application?.status }}</p>
        <div class="actions">
          <UiButton type="primary" @click="navigate('review')">Review</UiButton>
          <UiButton @click="navigate('decision')">Decision</UiButton>
        </div>
      </div>
    </UiSection>
  </UiPage>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getAdmissionApplication } from '@shared/api-client';

interface Props {
  applicationId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const loading = ref(false);
const application = ref<{ id: string; applicantName: string; program: string; status: string } | null>(null);

const fetchApplication = async () => {
  if (!props.applicationId) return;
  loading.value = true;
  try {
    application.value = await getAdmissionApplication(props.applicationId);
  } finally {
    loading.value = false;
  }
};

const navigate = (target: string) => {
  router.push(`/admission/applications/${props.applicationId}/${target}`);
};

onMounted(fetchApplication);
watch(() => props.applicationId, fetchApplication);
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
</style>
