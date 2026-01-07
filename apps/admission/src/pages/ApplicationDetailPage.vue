<template>
  <UiPage>
    <UiPageHeader title="جزئیات درخواست" subtitle="زمان‌بندی و پیوست‌ها" />
    <UiSection>
      <div v-if="loading">در حال بارگذاری...</div>
      <div v-else>
        <p><strong>شناسه:</strong> {{ application?.id }}</p>
        <p><strong>متقاضی:</strong> {{ application?.applicantName }}</p>
        <p><strong>رشته:</strong> {{ application?.program }}</p>
        <p><strong>وضعیت:</strong> {{ application?.status }}</p>
        <div class="actions">
          <UiButton type="primary" @click="navigate('review')">بازبینی</UiButton>
          <UiButton @click="navigate('decision')">تصمیم</UiButton>
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
