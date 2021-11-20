import JoinRoomForm from '@/components/JoinRoomForm'
import Layout from '@/components/containers/Layout'

export default function Home() {
  return (
    <Layout>
      <section className="flex min-w-full items-center justify-center">
        <JoinRoomForm />
      </section>
    </Layout>
  )
}
