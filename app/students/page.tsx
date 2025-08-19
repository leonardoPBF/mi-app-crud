"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

export default function Students() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    Name: "",
    Address: "",
    Phone: "",
    Observacion: "",
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  // Cargar estudiantes al montar
  useEffect(() => {
    fetchStudents()
  }, [])

  // Obtener estudiantes
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("student")
        .select("*")
        .order("id", { ascending: true })

      if (error) throw error
      setStudents(data || [])
    } catch (err: any) {
      console.error("Error fetching students:", err)
      setError("Error al cargar estudiantes")
    } finally {
      setLoading(false)
    }
  }

  // Crear estudiante
  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("student")
        .insert([formData])
        .select()

      if (error) throw error
      setStudents([...students, ...data])
      resetForm()
      setError("")
    } catch (err: any) {
      console.error("Error creating student:", err)
      setError("Error al crear estudiante: " + err.message)
    }
  }

  // Actualizar estudiante
  const updateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("student")
        .update(formData)
        .eq("id", editingId)
        .select()

      if (error) throw error
      setStudents(
        students.map((student) =>
          student.id === editingId ? data[0] : student
        )
      )
      resetForm()
      setError("")
    } catch (err: any) {
      console.error("Error updating student:", err)
      setError("Error al actualizar estudiante: " + err.message)
    }
  }

  // Eliminar estudiante
  const deleteStudent = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return
    try {
      const { error } = await supabase.from("student").delete().eq("id", id)
      if (error) throw error
      setStudents(students.filter((student) => student.id !== id))
      setError("")
    } catch (err: any) {
      console.error("Error deleting student:", err)
      setError("Error al eliminar estudiante: " + err.message)
    }
  }

  // Editar estudiante (cargar en form)
  const editStudent = (student: any) => {
    setFormData({
      Name: student.Name,
      Address: student.Address,
      Phone: student.Phone,
      Observacion: student.Observacion,
    })
    setEditingId(student.id)
  }

  // Reset form
  const resetForm = () => {
    setFormData({ Name: "", Address: "", Phone: "", Observacion: "" })
    setEditingId(null)
  }

  // Handle inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="p-4">Cargando estudiantes...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Estudiantes</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Editar Estudiante" : "Nuevo Estudiante"}
        </h2>

        <form
          onSubmit={editingId ? updateStudent : createStudent}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Teléfono
            </label>
            <input
              type="text"
              name="Phone"
              value={formData.Phone}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="Address"
              value={formData.Address}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Observaciones
            </label>
            <textarea
              name="Observacion"
              value={formData.Observacion}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {editingId ? "Actualizar" : "Crear"} Estudiante
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de estudiantes */}
      <div className="bg-white shadow-md rounded">
        <h2 className="text-xl font-semibold p-4 border-b">Lista de Estudiantes</h2>

        {students.length === 0 ? (
          <p className="p-4 text-gray-500">No hay estudiantes registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.Name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.Phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.Address}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.Observacion}</td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => editStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
