from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[
            ('superuser', 'Superusuario'),
            ('editor', 'Editor'),
            ('user', 'Usuario Normal')
        ],
        required=False,
        write_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_superuser', 'is_staff', 'is_active', 'role']
        read_only_fields = ['is_superuser', 'is_staff']

    def create(self, validated_data):
        role = validated_data.pop('role', 'user')
        password = validated_data.pop('password', None)
        if password is None:
            raise serializers.ValidationError({"password": "Este campo es requerido."})
        user = User(**validated_data)
        user.set_password(password)

        # Asignar el rol basado en el campo 'role'
        if role == 'superuser':
            user.is_superuser = True
            user.is_staff = True
        elif role == 'editor':
            user.is_staff = True
        else:
            user.is_staff = False

        user.save()
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if role:
            if role == 'superuser':
                instance.is_superuser = True
                instance.is_staff = True
            elif role == 'editor':
                instance.is_superuser = False
                instance.is_staff = True
            else:
                instance.is_superuser = False
                instance.is_staff = False

        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Calcular el rol basado en las propiedades del usuario
        if instance.is_superuser:
            representation['role'] = 'superuser'
        elif instance.is_staff:
            representation['role'] = 'editor'
        else:
            representation['role'] = 'user'
        return representation
