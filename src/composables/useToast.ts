import { useToastController as bvUseToast } from 'bootstrap-vue-next/composables/useToastController'

export const useToast = () => {
  const toast = bvUseToast()

  const success = (obj: { message?: string; duration?: number } = {}) => {
    return toast.show?.({
      props: {
        body: obj.message,
        title: 'Success!',
        value: obj.duration ?? 2500,
        variant: 'success'
      }
    })
  }

  const error = (obj: { message?: string; duration?: number } = {}) => {
    return toast.show?.({
      props: {
        variant: 'danger',
        body: obj.message,
        title: 'Error!',
        value: obj.duration ?? 5000
      }
    })
  }

  return {
    ...toast,
    success,
    error
  }
}
