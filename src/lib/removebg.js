export async function quitarFondo(archivo) {
  const formData = new FormData()
  formData.append('image_file', archivo)
  formData.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': 'YrvHYSxLJVibzc5KKv7DMyKN',
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Error quitando el fondo')
  }

  const blob = await response.blob()
  return new File([blob], 'prenda_sin_fondo.png', { type: 'image/png' })
}