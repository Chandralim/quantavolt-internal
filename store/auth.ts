import { defineStore } from 'pinia';
import { useErrorStore } from '~/store/error';

interface UserPayloadInterface {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    loading: false,
    loading_full: false,
  }),
  actions: {
    async authenticateUser({ email, password }: UserPayloadInterface) {
      return new Promise<any>(async (resolve, reject) => {

        const { data, error, status, pending }: any = useLazyFetch('http://127.0.0.1:8000/api/internal/login', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email,
            password,
          },
          timeout: 1000,
        });

        this.loading = pending.value;
        while (pending.value) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.loading = pending.value;

        if (status.value == "error") {
          reject(error);
        } else {
          if (data.value) {
            const token = useCookie('token'); // useCookie new hook in nuxt 3
            token.value = data?.value?.token; // set token to cookie
            this.authenticated = true; // set authenticated  state value to true
          }
          resolve(data);
        }


        // const { data, error, status, pending }: any = await useLazyFetch('http://127.0.0.1:8000/api/internal/login', {
        //   method: 'post',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: {
        //     email,
        //     password,
        //   },
        //   timeout: 1000,
        // });

        // this.loading = pending;
        // console.log(pending.value);


        // if (status.value == "error") {
        //   reject(error);
        // } else {
        //   if (data.value) {
        //     const token = useCookie('token'); // useCookie new hook in nuxt 3
        //     token.value = data?.value?.token; // set token to cookie
        //     this.authenticated = true; // set authenticated  state value to true
        //   }
        //   resolve(data);
        // }
      })
    },
    checkUser() {
      const token = useCookie('token'); // useCookie new hook in nuxt 3

      return new Promise<any>(async (resolve, reject) => {
        const { data, error, status, pending }: any = useLazyFetch('http://127.0.0.1:8000/api/internal/check_user', {
          method: 'get',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          },
          // body: {
          //   email,
          //   password,
          // },
          timeout: 1000,
        });

        this.loading_full = pending.value;
        while (pending.value) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.loading_full = pending.value;

        if (status.value == "error") {
          const { trigger } = useErrorStore();
          trigger(error);
          reject(error);
        } else {
          if (data.value) {
            const email = useCookie('email'); // useCookie new hook in nuxt 3
            email.value = data?.value?.user?.email; // set token to cookie

            const scopes = useCookie('scopes'); // useCookie new hook in nuxt 3
            scopes.value = data?.value?.user?.scopes; // set token to cookie
          }
          resolve(data);
        }

      })
    },
    logUserOut() {
      this.authenticated = false; // set authenticated  state value to false

      const token = useCookie('token'); // useCookie new hook in nuxt 3
      token.value = null; // clear the token cookie

      const email = useCookie('email'); // useCookie new hook in nuxt 3
      email.value = null; // set token to cookie

      const scopes = useCookie('scopes'); // useCookie new hook in nuxt 3
      scopes.value = null;
    },
  },
});