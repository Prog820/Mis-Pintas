export async function quitarFondo(archivo) {
  const formData = new FormData()
  formData.append('image_file', archivo)
  formData.append('size', 'auto')
  const REMOVEBG_KEY = import.meta.env.VITE_REMOVEBG_API_KEY

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key':REMOVEBG_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
  const error = await response.text()
  console.error(error)
  throw new Error(error)
}

  const blob = await response.blob()
  return new File([blob], 'prenda_sin_fondo.png', { type: 'image/png' })
}